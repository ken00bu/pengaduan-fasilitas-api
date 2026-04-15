import { BadRequestException, NotFoundException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserType } from './entity/user.entity';
import type { User as CurrentUser } from './type/user.type';
import { Repository } from 'typeorm';
import { CreateUnverifiedUserDto } from './dto/create-unverified-user.dto';
import { createTransport } from 'nodemailer'
import { UserRoles } from './entity/user.entity';
import { FindTechniciansDto } from './dto/find-technicians.dto';
import { GetTechniciansSummaryDto } from './dto/get-technicians-summary.dto';
import { Report } from 'src/reports/entity/report.entity';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import * as bcrypt from 'bcrypt';
import { Skill } from 'src/skills/entity/skill.entity';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Report)
        private reportRepository: Repository<Report>,
        @InjectRepository(Skill)
        private skillRepository: Repository<Skill>
    ){}

    // Auth
    async createUnverifiedUser(createUnverifiedUserDto: CreateUnverifiedUserDto): Promise<User> {
        const user = new User();
        user.email = createUnverifiedUserDto.email
        user.user_type = createUnverifiedUserDto.userType

        return await this.userRepository.save(user)
    }

    async isEmailExist(email: string): Promise<boolean> {
        return await this.userRepository.exists({
            where: {
                email: email
            },
        })
    }

    async isEmailExistAndVerified(email:string): Promise<Boolean>{
        const user:User | null = await this.userRepository.findOneBy({
            email: email
        })
        if (user && user.email_is_verified)return true

        return false
    }

    async findUserByEmail(email: string): Promise<User | null>{
        return await this.userRepository.findOneBy({
            email: email
        })
    }

    async completeUserVerification({email, password, username}){
        return await this.userRepository.update({ email }, {hashed_password: password, email_is_verified: true, username})
    }



    // User Technician
    async createTechnician(dto: CreateTechnicianDto){
        const { username, password, email, skillId } = dto

        const skill = await this.skillRepository.findOneBy({ id: skillId })
        if(!skill) throw new NotFoundException('Skill not found')

        try {
            return await this.userRepository.save({
                username,
                email,
                skill,
                hashed_password: await bcrypt.hash(password, await bcrypt.genSalt()),
                user_type: UserType.STAFF,
                role: UserRoles.TECHNICIAN
            })
        } catch (error) {
            throw new BadRequestException('Failed to create Technician')
        }
    }


    async findOneTechnicianById(id: number){
        return await this.userRepository.findOne({
            where: {
                id: id,
                role: UserRoles.TECHNICIAN
            }
        })
    }

    async findManyTechnicians(dto: FindTechniciansDto, currentUser: CurrentUser): Promise<Record<string, any>[]>{
        const query = await this.userRepository.createQueryBuilder('users')
            .leftJoin('users.skill', 'skill')
            .leftJoin('users.assigned_reports', 'reports')
            .leftJoin('reports.priority', 'priority')

        const baseSelect = [
            'users.id',
            'users.phone_number',
            'users.username',
            'skill.id',
            'skill.name',
        ]

        query.select(baseSelect)
        query.addSelect(
            `SUM(CASE WHEN reports.status = 'done' THEN 1 ELSE 0 END)`,
            'totalFinished'
        )
        query.addSelect(
            `SUM(CASE WHEN reports.status = 'done' THEN TIMESTAMPDIFF(HOUR, reports.createdAt, reports.slaDate) ELSE 0 END)`,
            'totalHours'
        )
        query.groupBy('users.id')
        query.andWhere('users.role = :role', { role: UserRoles.TECHNICIAN })
        console.log('dto:', dto)
        if(dto.isAssigned === true){
            query.andWhere(qb => {
                console.log('assigned true')
                const subQuery = qb.subQuery()
                    .select('1')
                    .from('reports', 'r')
                    .where('r.assignedTechnicianId = users.id')
                    .andWhere('r.status = :assignedStatus', { assignedStatus: 'progress' })
                    .getQuery()
                return `EXISTS ${subQuery}`
            })
        }

        if(dto.isAssigned === false){
            query.andWhere(qb => {
                console.log('assigned false')
                const subQuery = qb.subQuery()
                    .select('1')
                    .from('reports', 'r')
                    .where('r.assignedTechnicianId = users.id')
                    .andWhere('r.status = :assignedStatus', { assignedStatus: 'progress' }) 
                    .getQuery()
                return `NOT EXISTS ${subQuery}`
            })
        }

        if(dto.id){
            query.andWhere('users.id = :id', { id:dto.id })
            query.addSelect(['users.email', 'users.created_at'])
        }

        if(dto.name){
            query.andWhere('users.username LIKE :name', {name: `%${dto.name}%`})
        }

        if(dto.skill && dto.skill !== 'all'){
            query.andWhere('skill.name LIKE :skill', {skill: `%${dto.skill}%`})
        }
        
        if(dto.orderBy === 'weight'){
            query.addSelect('SUM(priority.weight)', 'totalWeight')
                .groupBy('users.id')
                .orderBy('totalWeight', 'ASC')

            if (dto?.page && dto?.limit) {
                const limit = Number(dto.limit);
                const skip = (Number(dto.page) - 1) * limit;
                query.skip(skip).take(limit);
            }

            const { raw, entities } = await query.getRawAndEntities()

            const result = entities.map((entity, index) => ({
                ...entity,
                totalWeight: Number(raw[index]?.totalWeight) ?? 0,
                totalFinished: Number(raw[index]?.totalFinished) ?? 0,
                totalHours: Number(raw[index]?.totalHours) ?? 0
            }))

            if(!result.length) throw new NotFoundException('Technicians not found')
            return result
        }


        if (dto?.page && dto?.limit) {
            const limit = Number(dto.limit);
            const skip = (Number(dto.page) - 1) * limit;
            query.skip(skip).take(limit);
        }

        const { raw, entities } = await query.getRawAndEntities()

        const result = entities.map((entity, index) => ({
            ...entity,
            totalFinished: Number(raw[index]?.totalFinished) ?? 0,
            totalHours: Number(raw[index]?.totalHours) ?? 0
        }))

        if(!result.length){
            throw new NotFoundException('Technicians not found')
        }

        return result
    }

    // get technicians statistic
    async getTechnicianSummary(dto: GetTechniciansSummaryDto){
        
        const query = await this.userRepository.createQueryBuilder('users')
        query.leftJoin('users.skill', 'skill')
        query.andWhere('users.role = :role', { role: UserRoles.TECHNICIAN })
        query.select("COUNT(*)", "total")
        query.addSelect("skill.name", "skill")
        query.groupBy('skill.name')

        if(dto.skill){
            query.andWhere('skill.name = :skill', { skill: dto.skill })
        }
        
        const raw = await query.getRawMany();

        const count = {};

        for (const item of raw) {
            count[item.skill.toLowerCase()] = Number(item.total);
        }

        const total = await this.userRepository.count({
        where: {
            role: UserRoles.TECHNICIAN
        }
        });

        const assignedCount = await this.userRepository.createQueryBuilder('users')
            .innerJoin('users.assigned_reports', 'reports')
            .where('users.role = :role', { role: UserRoles.TECHNICIAN })
            .andWhere('reports.status = :status', { status: 'progress' })
            .select('COUNT(DISTINCT users.id)', 'total')
            .getRawOne()

        return {
            total,
            assigned: Number(assignedCount?.total) ?? 0,
            skill: count,
        }
    }


}
