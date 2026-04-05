import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Skill } from './entity/skill.entity';

@Injectable()
export class SkillsService {

    constructor(
        @InjectRepository(Skill)
        private skillsRepository: Repository<Skill>
    ){}

    async findMany(){
        const query = this.skillsRepository.createQueryBuilder('skills')
        query.select([
            'skills.id',
            'skills.name'
        ])

        return await query.getMany()
    }

}
