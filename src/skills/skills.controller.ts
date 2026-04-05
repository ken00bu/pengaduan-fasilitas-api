import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRoles } from 'src/users/entity/user.entity';
import { SkillsService } from './skills.service';

@Controller('skills')
export class SkillsController {

    constructor(private skillService: SkillsService){}

    @Get()
    @Roles([UserRoles.ADMIN])
    @UseGuards(AuthGuard, RolesGuard)
    async findSkills(){
        return await this.skillService.findMany()
    }

}
