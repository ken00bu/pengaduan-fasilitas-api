import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { PriorityService } from './priority.service';
import { CreatePriorityDto } from './dto/create-priority.dto';
import { UserRoles } from 'src/users/entity/user.entity';

@Controller('priority')
export class PriorityController {

    constructor(private priorityService: PriorityService){}

    @Post()
    @Roles([UserRoles.ADMIN])
    @UseGuards(AuthGuard, RolesGuard)
    async createPriority(
        @Body() createPriorityDto: CreatePriorityDto
    ){
        return this.priorityService.createPriority(createPriorityDto)
    }
}
