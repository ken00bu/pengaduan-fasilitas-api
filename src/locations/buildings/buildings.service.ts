import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBuildingDto } from '../dto/create-building.dto';
import { Building } from '../entity/building.entity';
import { Faculty } from '../entity/faculty.entity';
import { FacultiesService } from '../faculties/faculties.service';
import { BuildingsFilterDto } from '../dto/buildings-filter.dto';

@Injectable()
export class BuildingsService {

    constructor(
        @InjectRepository(Building)
        private buildingRepository: Repository<Building>,
        private facultiesService: FacultiesService
    ){}

    async createBuilding(createBuildingDto: CreateBuildingDto){

        const building = new Building()
        building.name = createBuildingDto.name.toLocaleLowerCase()
        building.floors = createBuildingDto.floors
        building.isGeneral = createBuildingDto.facultyId === 3 ? true : createBuildingDto.isGeneral ? createBuildingDto.isGeneral : false
        console.log(createBuildingDto.facultyId)

        if(!building.isGeneral){
            const faculty: Faculty | null = await this.facultiesService.findFacultyById(createBuildingDto.facultyId)
            console.log(faculty)
            if (!faculty) throw new BadRequestException('faculty not exist')
            building.faculty = faculty
        }
        
        try {
            const savedBuilding = await this.buildingRepository.save(building)
            return {
                message: "Building successfully added",
                building: savedBuilding
            }
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new BadRequestException('Duplicate building');
            }
            console.log('error lo dongo')
            throw error
        }
    }

    async findMany(dto: BuildingsFilterDto){
        const query = this.buildingRepository.createQueryBuilder('buildings').leftJoinAndSelect('buildings.faculty', 'faculty')

        if(dto.faculty !== undefined){
            query.andWhere('faculty.name = :facultyName', { facultyName: dto.faculty })
        }

        if(dto.floors !== undefined){
            query.andWhere('buildings.floors = :floors', {floors: Number(dto.floors)})
        }

        if(dto.name !== undefined){
            query.andWhere('buildings.name = :name', {name: dto.name})
        }

        if(dto.isGeneral !== undefined){
            query.orWhere('buildings.isGeneral = :isGeneral', {isGeneral: dto.isGeneral === "true" ? true : false })
        }

        return query.getMany()
    }

    async findOneById(id: number): Promise<Building | null>{
        return await this.buildingRepository.findOneBy({id})
    }

}
