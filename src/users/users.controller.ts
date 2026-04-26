import { Controller, Get, Query, UseGuards, Param, Post, Body } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { User } from './type/user.type';
import { FindTechniciansDto } from './dto/find-technicians.dto';
import { UsersService } from './users.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRoles } from './entity/user.entity';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { GetTechniciansSummaryDto } from './dto/get-technicians-summary.dto';
import { CreateTechnicianDto } from './dto/create-technician.dto';

@Controller('users')
export class UsersController {

    constructor(
        private usersService: UsersService
    ){}

    @Get('technicians')
    @UseGuards(AuthGuard)
    async findTechnicians(
        @Query() dto: FindTechniciansDto,
        @CurrentUser() currentUser: User
    ) {
        return await this.usersService.findManyTechnicians(dto, currentUser)
    }

    @Get('technicians/summary')
    @Roles([UserRoles.ADMIN])
    @UseGuards(AuthGuard, RolesGuard)
    async findTechniciansStatistic(
        @Query() dto: GetTechniciansSummaryDto,
        @CurrentUser() currentUser: User
    ) {
        return await this.usersService.getTechnicianSummary(dto)
    }

    @Post('technicians')
    @Roles([UserRoles.ADMIN])
    @UseGuards(AuthGuard, RolesGuard)
    async createTechnician(
        @Body() dto: CreateTechnicianDto
    ){
        return await this.usersService.createTechnician(dto) 
    }

    @Get('me')
    @UseGuards(AuthGuard)
    async getProfile(@CurrentUser() currentUser: User) {
        return await this.usersService.getMe(currentUser);
    }

}
