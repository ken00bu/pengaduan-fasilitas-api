import { BadRequestException, NotFoundException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import type { User as CurrentUser } from './type/user.type';
import { Repository } from 'typeorm';
import { CreateUnverifiedUserDto } from './dto/create-unverified-user.dto';
import { createTransport } from 'nodemailer'
import { UserRoles } from './entity/user.entity';
import { FindTechniciansDto } from './dto/find-technicians.dto';
import { GetTechniciansSummaryDto } from './dto/get-technicians-summary.dto';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
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
    async findOneTechnicianById(id: number){
        return await this.userRepository.findOne({
            where: {
                id: id,
                role: UserRoles.TECHNICIAN
            }
        })
    }

    async findManyTechnicians(dto: FindTechniciansDto, currentUser: CurrentUser){
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
        query.andWhere('users.role = :role', { role: UserRoles.TECHNICIAN })

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
                totalWeight: Number(raw[index]?.totalWeight) ?? 0
            }))

            if(!result.length) throw new NotFoundException('Technicians not found')
            return result
        }


        if (dto?.page && dto?.limit) {
            const limit = Number(dto.limit);
            const skip = (Number(dto.page) - 1) * limit;
            query.skip(skip).take(limit);
        }

        const technicians = await query.getMany()
        console.log(`technicians: ${technicians}`)
        if(!technicians.length){
            throw new NotFoundException('Technicians not found')
        }

        return technicians
            
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

        return {
            total,
            count
        }
    }


}
