import { Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from './entity/location.entity';
import { Faculty } from './entity/faculty.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LocationsService {

    constructor(
        @InjectRepository(Location)
        private locationRepository: Repository<Location>,
        @InjectRepository(Faculty)
        private facultyRepository: Repository<Faculty>
    ){}

    async createLocation(createLocationDto: CreateLocationDto){

        const buildingId = createLocationDto.buildingId
        const detail = createLocationDto.detail
        const room = createLocationDto.room
        const floor = createLocationDto.floor
        
        const savedLocation = await this.locationRepository.save({
            building: {id: buildingId},
            detail: detail,
            room: room,
            floor: floor
        })

        return {
            message: "success cuy",
            location: savedLocation
        }
    }

    async getAllLocations() {
        return await this.facultyRepository
            .createQueryBuilder('faculty')
            .leftJoinAndSelect('faculty.building', 'building')
            .orderBy('CASE WHEN faculty.id = :pinnedId THEN 0 ELSE 1 END', 'ASC')
            .addOrderBy('faculty.name', 'ASC')
            .addOrderBy('building.name', 'ASC')
            .setParameter('pinnedId', 1)
            .getMany();
    }

}
