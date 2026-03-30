import { Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from './entity/location.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LocationsService {

    constructor(
        @InjectRepository(Location)
        private locationRepository: Repository<Location>
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

}
