import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUnverifiedUserDto } from './dto/create-unverified-user.dto';
import { createTransport } from 'nodemailer'
import { UserRoles } from './entity/user.entity';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ){}

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

    async findOneTechnicianById(id: number){
        return await this.userRepository.findOne({
            where: {
                id: id,
                role: UserRoles.TECHNICIAN
            }
        })
    }

}
