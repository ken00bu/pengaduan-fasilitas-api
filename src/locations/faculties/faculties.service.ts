import { Injectable, BadRequestException } from '@nestjs/common';
import { createFacultyDto } from '../dto/create-faculty.dt0';
import { InjectRepository } from '@nestjs/typeorm';
import { Faculty } from '../entity/faculty.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FacultiesService {

    constructor(
        @InjectRepository(Faculty)
        private facultyRepository: Repository<Faculty>
    ){}    

    async createFaculty(createFacultyDto: createFacultyDto){
        
        const faculty = new Faculty()
        faculty.code = createFacultyDto.code
        faculty.name = createFacultyDto.name

        try {
            await this.facultyRepository.save(faculty)
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new BadRequestException('Duplicate faculty');
            }
            throw error
        }

        return {
            message: "faculty successfully added"
        }
    }

    async findFacultyById(id: number){
        if(!id)return null
        return await this.facultyRepository.findOneBy({id})
    }

    async getAllFaculties(){
        return await this.facultyRepository.find({
            select:{
                id: true,
                name: true,
                code: true,
            }
        })
    }

}