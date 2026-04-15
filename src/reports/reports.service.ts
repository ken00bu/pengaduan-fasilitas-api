import { BadRequestException, Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entity/report.entity';
import { CategoriesService } from 'src/categories/categories.service';
import { Category } from 'src/categories/entity/category.entity';
import { S3Client, PutObjectAclCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { Building } from 'src/locations/entity/building.entity';
import { Location } from 'src/locations/entity/location.entity';
import { BuildingsService } from 'src/locations/buildings/buildings.service';
import { getFilteredDto } from './helpers/getFilteredDto';
import { LocationsService } from 'src/locations/locations.service';
import { CreateLocationDto } from 'src/locations/dto/create-location.dto';
import { ForbiddenException } from '@nestjs/common';
import { UpdateReportDto } from './dto/update-report.dto';
import { UpdateReportV2Dto } from './dto/update-report-v2.dto';
import { UserRoles } from 'src/users/entity/user.entity';
import { User } from 'src/users/type/user.type';
import { UsersService } from 'src/users/users.service';
import { ReportStatus } from './entity/enum/report-status.enum';
import { SlaStatus } from './entity/enum/sla-status.enum';
import { FindReportDto } from './dto/find-report.dto';
import { PriorityService } from 'src/priority/priority.service';
import { formatTicketId } from 'src/shared/utils/stringFormat';

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

        return {
            message: 'Report successfully added',
            report: reportwithupdate
        }
    }

    async updateReport(dto: UpdateReportDto, user: User, file: Express.Multer.File){

        console.log('report update masuk')
        //cek apakah report exist
        const report = await this.findReport(dto.reportId)
        if (!report) throw new BadRequestException("Report not found")

        //cek apakah report id milik user jika dia bukan admin atau technician
        if(user.id != report.user.id && user.role === UserRoles.USER) throw new BadRequestException('Report is not yours')

        //cek file dan role
        if(file && user.role !== UserRoles.USER){
            throw new BadRequestException("You can't change user image")
        }

        if(file){
            const format = file.mimetype === "image/jpeg" ? '.jpeg' : '.png'
            console.log('file di upload dengan format: ', format)
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

        //filter dto berdasarkan role
        const adminFields = ['categoryId', 'location', 'description', 'status', 'assignedTechnicianId', 'adminNote', 'priority']
        const userFields = ['categoryId', 'location', 'description']
        const technicianFields = ['status', 'technicianNote']
        const technicianAllowedStatus = [ReportStatus.REJECTED, ReportStatus.DONE]
        const allowedFields = user.role === UserRoles.ADMIN ? adminFields : user.role === UserRoles.TECHNICIAN ? technicianFields : userFields

        const filteredDto = Object.fromEntries(Object.entries(dto).filter(([key])=>{
            return allowedFields.includes(key)
        }))

         //jika ada category apakaha ada? kalau ada ganti relasinya
        if(filteredDto.categoryId){
            const category = await this.categoriesService.findCategoryById(dto.categoryId)
            if(!category) throw new BadRequestException('Category not found')

            report.category = category
        }

        //cek apakah assigned technician di set, kalau ada cek lagi apakah ada kalau ada ganti :) (belum di test)
        if(filteredDto.assignedTechnicianId){
            const technician = await this.usersService.findOneTechnicianById(filteredDto.assignedTechnicianId)
            if(!technician) throw new BadRequestException('Technician not found')
            report.assignedTechnician = technician
        }

        //handle update location
        if (filteredDto.location){
            Object.assign(report.location, dto.location);
        }

        //handle stutus
        if(filteredDto.status){

            if(user.role === 'technician' && !technicianAllowedStatus.includes(filteredDto.status)){
              throw new BadRequestException('Technicians are only allowed to set the report status to Done or Rejected')  
            } 

            let finalStatus = filteredDto.status
            if(filteredDto.status === ReportStatus.REJECTED && user.role === UserRoles.TECHNICIAN ){
                finalStatus = ReportStatus.REJECTED_BY_TECHNICIAN
            } 
            if(filteredDto.status === ReportStatus.DONE){
                finalStatus = ReportStatus.DONE
                if(report.slaDate < new Date()) report.slaStatus = SlaStatus.LATE
            } 

            report.status = finalStatus

        }

        //handle description
        if(filteredDto.description){
            report.description = filteredDto.description
        }

        //handle note admin
        if(filteredDto.adminNote){
            report.adminNote = filteredDto.adminNote
        }

        //handle note technician
        if(filteredDto.technicianNote){
            report.technicianNote = filteredDto.technicianNote
        }

        if(filteredDto.priority){
            const priority = await this.priorityService.findPriorityById(filteredDto.priority)
            if(!priority) throw new BadRequestException('Invalid priority')
            report.priority = priority
        }

        const updatedReport = await this.reportRepository.save(report)
        return {
            message: "Report updated",
            report: updatedReport
        }

    }

    async updateReportV2(file: Express.Multer.File, dto: UpdateReportV2Dto, user: User){

        //cek laporan dan kepemilikannya
        const report = await this.findReport(dto.id)
        if (!report) throw new BadRequestException('Report not found')
        const isOwner = user.id === report.user.id
        const isPrivileged = [UserRoles.ADMIN, UserRoles.TECHNICIAN].includes(user.role)
        if(!isOwner && !isPrivileged) throw new ForbiddenException('Report is not yours')

        //filter dto
        const {filteredDto, errors} = getFilteredDto(dto, user.role)
        if(errors.length > 0) throw new BadRequestException(`Can't update certain field: ${errors}`) 

        //upload file ke r2
        if(file){
            if(user.role !== UserRoles.USER) throw new BadRequestException(`You aren't allowed to change user image`)
            const format = file.mimetype === "image/jpeg" ? '.jpeg' : '.png'
            console.log('file di upload dengan format: ', format)
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

        if (filteredDto.assignedTechnicianId) {
            assignedTechnician = await this.usersService.findOneTechnicianById(Number(filteredDto.assignedTechnicianId))
            if (!assignedTechnician) throw new NotFoundException('Technician not found')
            report.assignedTechnician = assignedTechnician
        }

        if (filteredDto.priority) {
            priority = await this.priorityService.findPriorityById(Number(filteredDto.priority))
            if (!priority) throw new NotFoundException('Priority not found')
            report.priority = priority
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
            'priority.name'
        ];

        let filteredSelect = [...baseSelect];

        if (user.role === UserRoles.ADMIN) {
            filteredSelect.push(
                'reports.technicianNote',
                'user.id',
                'user.email',
                'priority.weight',
                'technician.id',
            );
        }

        if (user.role === UserRoles.USER) {
            filteredSelect.push(

            );
        }

        query.select(filteredSelect);

        if (user.role !== UserRoles.ADMIN) {
            query.andWhere('user.id = :userId', { userId: user.id });
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
                user.role !== UserRoles.ADMIN &&
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

        if(dto?.like){
            query.andWhere('reports.title LIKE :like', { like: `%${dto.like}%` })
        }


        if (dto?.page && dto?.limit) {
            const limit = Number(dto.limit);
            const skip = (Number(dto.page) - 1) * limit;
            query.skip(skip).take(limit);
        }

        const reports = await query.orderBy(user.role === UserRoles.ADMIN || user.role === UserRoles.TECHNICIAN ? 'priority.weight' : 'reports.createdAt', 'DESC').getMany();

        if (dto?.id && !reports.length) {
            throw new NotFoundException('Report not found or not accessible');
        }

        return reports;
    }

    async findStatistic(currentUser: User){
        const user = await this.usersService.findUserByEmail(currentUser.email)
        if(!user) throw new BadRequestException('User not exist')
        const isAdmin = currentUser.role === UserRoles.ADMIN ? true : false
        
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

