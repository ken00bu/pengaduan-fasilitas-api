import { BadRequestException, Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entity/report.entity';
import { CategoriesService } from 'src/categories/categories.service';
import { Category } from 'src/categories/entity/category.entity';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { Building } from 'src/locations/entity/building.entity';
import { BuildingsService } from 'src/locations/buildings/buildings.service';
import { getFilteredDto } from './helpers/getFilteredDto';
import { LocationsService } from 'src/locations/locations.service';
import { ForbiddenException } from '@nestjs/common';
import { UpdateReportDto } from './dto/update-report.dto';
import { UserRoles } from 'src/users/entity/user.entity';
import { User } from 'src/users/type/user.type';
import { UsersService } from 'src/users/users.service';
import { ReportStatus } from './entity/enum/report-status.enum';
import { SlaStatus } from './entity/enum/sla-status.enum';
import { FindReportDto } from './dto/find-report.dto';
import { PriorityService } from 'src/priority/priority.service';
import { formatTicketId } from 'src/shared/utils/stringFormat';
import { Subject, Observable } from 'rxjs';
import e from 'express';

type SSEReportEvent = {
  type: 'new_report' | 'status_change' | 'report_updated' | 'reassigned' | 'assigned';
  title?: string;
  ticket?: string;
  from?: string;
  to?: string;
  timestamp: string;
  fromId?: number;
};

@Injectable()
export class ReportsService {

    constructor(
        @InjectRepository(Report) private reportRepository: Repository<Report>,
        private locationService: LocationsService,
        private categoriesService: CategoriesService,
        private buildingService: BuildingsService,
        private usersService: UsersService,
        @Inject('R2_CLIENT') private r2: S3Client,
        private priorityService: PriorityService
    ){}

    private reportSSE$ = new Subject<MessageEvent>();

    getReportsStream(): Observable<MessageEvent> {
        return this.reportSSE$.asObservable();
    }

    private emitSSEEvent(event: SSEReportEvent) {
    this.reportSSE$.next({
        data: JSON.stringify(event),
    } as MessageEvent);
    }



    async createReport(createReportDto: CreateReportDto, file: Express.Multer.File, currentUser: any){

        //cek kategori
        const category: Category | null = await this.categoriesService.findCategoryById(createReportDto.categoryId)
        if (!category) throw new BadRequestException('Category not found') 
        
        //cek building
        const building: Building | null = await this.buildingService.findOneById(createReportDto.buildingId)
        if (!building) throw new BadRequestException('Building not found') 
        if (Number(createReportDto.floor) > building.floors) throw new BadRequestException('invalid floors')
            
        //upload file
        const format = file.mimetype === "image/jpeg" ? '.jpeg' : '.png'
        console.log('file di upload dengan format: ', format)
        const key = "reports/" + randomUUID() + format
        if(file){
            try {   
                let response = await this.r2.send(new PutObjectCommand({
                    Bucket: "lapor-sarpras-bucket",
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype
                }))    
            } catch (error) {
                console.log(error)
                throw new BadRequestException('failed uploading your file')
            }
        }

        //hitung sla
        const reportSla = new Date(Date.now() + category.priority.slaHours * 60 * 60 * 1000);

        const report: Report = new Report()
        report.title = createReportDto.title
        report.priority = category.priority
        report.user = { id: currentUser.id } as any
        report.description = createReportDto.description
        report.location = {
            building: createReportDto.buildingId,
            room: createReportDto.room,
            detail: createReportDto.detail,
            floor: createReportDto.floor
        } as any 
        report.category = { id: createReportDto.categoryId } as any
        report.slaDate = reportSla
        report.imgUrl = key || ''
        const savedReport = await this.reportRepository.save(report)

        //generate ticket
        const ticket = formatTicketId(savedReport.id, savedReport.createdAt)
        const reportwithupdate = await this.reportRepository.update(savedReport.id, { ticket })

        //event ke admin
        this.emitSSEEvent({
            type: 'new_report',
            title: report.title,
            ticket: reportwithupdate.affected ? ticket : undefined,
            timestamp: new Date().toISOString(),
            fromId: currentUser.id
        });

        return {
            message: 'Report successfully added',
            report: reportwithupdate
        }
    }

    async updateReport(file: Express.Multer.File, dto: UpdateReportDto, user: User){

        //cek laporan dan kepemilikannya
        const report = await this.findReport(dto.id)
        if (!report) throw new BadRequestException('Report not found')
        const oldStatus = report.status
        const oldSlaStatus = report.slaStatus
        const oldTechnician = report.assignedTechnician?.id
        const isOwner = user.id === report.user.id
        const isPrivileged = [UserRoles.ADMIN, UserRoles.TECHNICIAN].includes(user.role)
        if(!isOwner && !isPrivileged) throw new ForbiddenException('Report is not yours')

        //filter dto
        const {filteredDto, errors} = getFilteredDto(dto, user.role, report.status)
        if(errors.length > 0) throw new BadRequestException(`Can't update certain field: ${errors}`) 

        //upload file ke r2
        if(file){
            if(user.role !== UserRoles.USER) throw new BadRequestException(`You aren't allowed to change user image`)
            const format = file.mimetype === "image/jpeg" ? '.jpeg' : '.png'
            const key = "reports/" + randomUUID() + format
            try {
                await this.r2.send(new PutObjectCommand({
                    Bucket: "lapor-sarpras-bucket",
                    Key: key,
                    Body: file.buffer,
                     ContentType: file.mimetype
                }))
                report.imgUrl = key
            } catch (error) {
                console.log(error)
                throw new BadRequestException('failed uploading your file')
            }
            
        }

        //cek apakah options ada
        let category 
        let building 
        let assignedTechnician 
        let priority 

        if (filteredDto.categoryId) {
            category = await this.categoriesService.findCategoryById(filteredDto.categoryId)
            if (!category) throw new NotFoundException('Category not found')
            report.category = category
        }

        if (filteredDto.buildingId) {
            building = await this.buildingService.findOneById(filteredDto.buildingId)
            if (!building) throw new NotFoundException('Building not found')
        }

        if (filteredDto.assignedTechnicianId !== undefined) {
            console.log('mencoba assign technician dengan id: ', filteredDto.assignedTechnicianId)
            // field dikirim di request
            if (filteredDto.assignedTechnicianId !== 'unassign') {
                console.log('assign technician')
                const assignedTechnician = await this.usersService.findOneTechnicianById(Number(filteredDto.assignedTechnicianId));
                if (!assignedTechnician) throw new NotFoundException('Technician not found');
                report.assignedTechnician = assignedTechnician;
            } else {
                console.log('unassign technician')
                report.assignedTechnician = null;
            }
        }

        if (filteredDto.priority) {
            priority = await this.priorityService.findPriorityById(Number(filteredDto.priority))
            if (!priority) throw new NotFoundException('Priority not found')
            report.priority = priority
        }

        if(filteredDto.status === ReportStatus.DONE && report.slaDate < new Date()){
            report.slaStatus = SlaStatus.LATE
        }
        
        //apply perubahan ke report
        const { categoryId, location, ...rest } = filteredDto
        const updatedReport = {
            ...(category && { category }),
            ...(assignedTechnician && { assignedTechnician }),
            ...(priority && { priority }),
            ...rest
        }

        if (filteredDto.location) {
            Object.assign(report.location, { building, ...filteredDto.location })
        }
        
        Object.assign(report, updatedReport)
        const newReport = await this.reportRepository.save(report)


        //jika technician di assign pertama kali, kirim event dengan type assigned
        if(!oldTechnician && newReport.assignedTechnician){
            this.emitSSEEvent({
                type: 'assigned',
                title: newReport.title,
                ticket: newReport.ticket,
                from: oldTechnician ? `Technician ID ${oldTechnician}` : 'Unassigned',
                to: newReport.assignedTechnician ? `Technician ID ${newReport.assignedTechnician.id}` : 'Unassigned',
                timestamp: new Date().toISOString(),
                fromId: user.id
            });
        }else if(oldTechnician !== newReport.assignedTechnician?.id){
            //jika technician di assign ulang, kirim event dengan type reassigned
            this.emitSSEEvent({
                type: 'reassigned',
                title: newReport.title,
                ticket: newReport.ticket,
                from: oldTechnician ? `Technician ID ${oldTechnician}` : 'Unassigned',
                to: newReport.assignedTechnician ? `Technician ID ${newReport.assignedTechnician.id}` : 'Unassigned',
                timestamp: new Date().toISOString(),
                fromId: user.id
            });
        } else {
            //jika selain itu, kirim event dengan type report_updated
            this.emitSSEEvent({
                type: 'report_updated',
                title: newReport.title,
                ticket: newReport.ticket,
                timestamp: new Date().toISOString(),
                fromId: user.id
            });
        }

        if(oldStatus !== newReport.status){
            //jika status berubah, kirim event dengan type status_change
            this.emitSSEEvent({
                type: 'status_change',
                title: newReport.title,
                ticket: newReport.ticket,
                from: oldStatus,
                to: newReport.status,
                timestamp: new Date().toISOString(),
                fromId: user.id
            });
        }

        // SLA status change event (pengajuan SLA oleh teknisi)
        if (oldSlaStatus !== newReport.slaStatus) {
            this.emitSSEEvent({
                type: 'status_change',
                title: newReport.title,
                ticket: newReport.ticket,
                from: oldSlaStatus,
                to: newReport.slaStatus,
                timestamp: new Date().toISOString(),
                fromId: user.id
            });
        }

        return {
            message: "Report updated",
            report: newReport
        }

    }

    async findReport(id){
        return await this.reportRepository.findOne({
            where: {id},
            relations: {
                user: true,
                location: true,
                category: true,
                assignedTechnician: true
            }
        }
    )
    }
    
    async findMany(dto: FindReportDto, user: User) {
        const query = this.reportRepository.createQueryBuilder('reports')
            .leftJoin('reports.category', 'category')
            .leftJoin('reports.location', 'location')
            .leftJoin('location.building', 'building')
            .leftJoin('building.faculty', 'faculty')
            .leftJoin('reports.user', 'user')
            .leftJoin('reports.assignedTechnician', 'technician')
            .leftJoin('reports.priority', 'priority');

        const baseSelect = [
            'reports.id',
            'reports.title',
            'reports.ticket',
            'user.username',
            'reports.slaDate',
            'reports.description',
            'reports.status',
            'reports.slaStatus',
            'reports.adminNote',
            'reports.reopenedAt',
            'reports.imgUrl',
            'reports.priority',
            'reports.createdAt',
            'technician.username',
            'technician.email',
            'category.id',
            'category.name',
            'location.floor',
            'location.room',
            'location.detail',
            'building.name',
            'faculty.name',
            'faculty.code',
            'priority.weight',
            'priority.name'
        ];

        let filteredSelect = [...baseSelect];

        if (user.role === UserRoles.ADMIN) {
            filteredSelect.push(
                'reports.technicianNote',
                'user.id',
                'user.email',
                'technician.id',
            );
        }

        if (user.role === UserRoles.USER) {
            filteredSelect.push(

            );
        }

        query.select(filteredSelect);

        if (user.role === UserRoles.USER) {
            query.andWhere('user.id = :userId', { userId: user.id });
        }

        if (user.role === UserRoles.TECHNICIAN){
            query.andWhere('technician.id = :technicianId', { technicianId: user.id })
        }

        if (dto?.id) {
            query.andWhere('reports.id = :reportId', { reportId: Number(dto.id) });
        }

        if (dto?.category) {
            query.andWhere('category.name = :category', { category: dto.category });
        }

        if (dto?.building) {
            query.andWhere('building.name = :building', { building: dto.building });
        }

        if (dto?.faculty) {
            query.andWhere('faculty.name = :faculty', { faculty: dto.faculty });
        }

        if (dto?.from && user.role === UserRoles.ADMIN) {
            query.andWhere('user.id = :fromId', { fromId: dto.from });
        }

        if (dto?.status) {
            if (
                user.role === UserRoles.USER &&
                dto.status === ReportStatus.REJECTED_BY_TECHNICIAN
            ) {
                throw new BadRequestException('Invalid status');
            }

            if (dto.status !== 'all') {
                query.andWhere('reports.status = :status', { status: dto.status });
            }
        }

        if(dto?.ticket){
            query.andWhere('reports.ticket = :ticket', { ticket: dto.ticket })
        }

        if(dto.slaStatus){
            query.andWhere('reports.slaStatus = :slaStatus', { slaStatus: dto.slaStatus })
        }

        if(dto?.like){
            console.log('mencari dengan like: ', dto.like)
            query.andWhere('(reports.title LIKE :like OR reports.ticket LIKE :like OR user.username LIKE :like OR category.name LIKE :like OR priority.name LIKE :like)', { like: `%${dto.like}%` })
        }

        const total = await query.getCount();

        if (dto?.page && dto?.limit) {
            const limit = Number(dto.limit);
            const skip = (Number(dto.page) - 1) * limit;
            query.skip(skip).take(limit);
        }

        // jika orderBy weighh gunakan weight, selain itu gunakan createdAt
        // sortOrder default DESC
        const reports = await query.orderBy( dto.orderBy === 'weight' ? 'priority.weight' : 'reports.createdAt', dto.sortOrder ).getMany();

        if (dto?.id && !reports.length) {
            throw new NotFoundException('Report not found or not accessible');
        }

        return {
            total,
            reports
        }
    }

    async findGeneral(ticket: string){
        console.log('type of ticket: ', typeof ticket)
        const query = this.reportRepository.createQueryBuilder('reports')
            .leftJoin('reports.category', 'category')
            .leftJoin('reports.location', 'location')
            .leftJoin('location.building', 'building')
            .leftJoin('building.faculty', 'faculty')
            .leftJoin('reports.user', 'user')
            .leftJoin('reports.assignedTechnician', 'technician')
            .leftJoin('reports.priority', 'priority')
            .select([
                'reports.id',
                'reports.title',
                'reports.ticket',
                'user.username',
                'reports.slaDate',
                'reports.description',
                'reports.status',
                'reports.slaStatus',
                'reports.reopenedAt',
                'reports.imgUrl',
                'reports.priority',
                'reports.createdAt',
                'technician.username',
                'category.id',
                'category.name',
                'priority.weight',
                'priority.name',
                'location.floor',
                'location.room',
                'location.detail',
                'building.name',
                'faculty.name',
                'faculty.code'
            ]);
        
        if(ticket){
            console.log('mencari dengan ticket: ', ticket)
            query.andWhere('reports.ticket = :ticket', { ticket: ticket })
        }
        const report = await query.getOne();

        if(!report) throw new NotFoundException('Report not found')

        return report
    }

    async findStatistic(currentUser: User){
        const user = await this.usersService.findUserByEmail(currentUser.email)
        if(!user) throw new BadRequestException('User not exist')
        const isTechnician = user.role === UserRoles.TECHNICIAN ? true : false
        const isAdmin = currentUser.role === UserRoles.ADMIN ? true : false
        const isUser = user.role === UserRoles.USER ? true : false

        if(isUser || isAdmin){
            const pendingCount = await this.reportRepository.count({
                where: {
                    ...isAdmin ? undefined : { user: {id: user.id} },
                    status: ReportStatus.PENDING
                }
            })
    
            const progressCount = await this.reportRepository.count({
                where: {
                    ...isAdmin ? undefined : { user: {id: user.id} },
                    status: ReportStatus.PROGRESS
                }
            })
    
            const doneCount = await this.reportRepository.count({
                where: {
                    ...isAdmin ? undefined : { user: {id: user.id} },
                    status: ReportStatus.DONE
                }
            })
    
            const rejectedCount = await this.reportRepository.count({
                where: {
                    ...isAdmin ? undefined : { user: {id: user.id} },
                    status: ReportStatus.REJECTED
                },
            })
    
            let rejectedByTechnicianCount
            if(isAdmin){
                rejectedByTechnicianCount = await this.reportRepository.count({
                    where: {
                        status: ReportStatus.REJECTED_BY_TECHNICIAN
                    }
                })
            }
    
    
            return {
                total: pendingCount + progressCount + doneCount + rejectedCount,
                count: {
                    pending: pendingCount,
                    progress: progressCount,
                    done: doneCount,
                    rejected: rejectedCount,
                    ...(isAdmin && { rejectedByTechnician: rejectedByTechnicianCount })
                }
            }
        }

        if(isTechnician){
            const assignedToMeCount = await this.reportRepository.count({
                where: {
                    assignedTechnician: {
                        id: user.id
                    }
                }
            })
            const finishedByMeCount = await this.reportRepository.count({
                where: {
                    assignedTechnician: {
                        id: user.id
                    },
                    status: ReportStatus.DONE
                }
            })

            return {
                totalAssigned: assignedToMeCount,
                finished: finishedByMeCount,
            }
        }
        

    }

    async deleteReport(id: number, currentUser: User){
        console.log('mencoba hapus report', id, 'current user: ', currentUser)
        const report = await this.reportRepository.findOne({
            where: {
                id: id,
                user: {
                    id: currentUser.id
                }
            }
        })
        console.log(report)
        if(!report) throw new NotFoundException('Report not found')
        const deletedReport = await this.reportRepository.remove(report)

        return {
            message: 'Report deleted successfully',
            report: deletedReport
        }
    }

}

