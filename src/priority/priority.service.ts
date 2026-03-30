import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Priority } from './entity/priority.entity';
import { Repository } from 'typeorm';
import { CreatePriorityDto } from './dto/create-priority.dto';

@Injectable()
export class PriorityService {

    constructor(
        @InjectRepository(Priority) private priorityRepository: Repository<Priority>
    ){}

    async createPriority(createPriorityDto: CreatePriorityDto){
        const priority = new Priority()
        priority.name = createPriorityDto.name
        priority.slaHours = createPriorityDto.slaHours
        priority.weight = createPriorityDto.weight

        const savedPriority = await this.priorityRepository.save(priority)
        return {
            message: 'Priority successfully added',
            priority: savedPriority
        }

    }

    async findPriorityById(id: number){
        return await this.priorityRepository.findOneBy({id: id})
    }

}
