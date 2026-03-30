import { Body, Controller, Post, Get } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { FacultiesService } from './faculties.service';
import { UseGuards } from '@nestjs/common';
import { createFacultyDto } from '../dto/create-faculty.dt0';
import { UserRoles } from 'src/users/entity/user.entity';

@Controller('faculties')
export class FacultiesController {

    constructor(
        private facultiesService: FacultiesService
    ){}

    @Post()
    @Roles([UserRoles.ADMIN])
    @UseGuards(AuthGuard, RolesGuard)
    async createFaculty(@Body() createFacultyDto: createFacultyDto){
        return await this.facultiesService.createFaculty(createFacultyDto)
    }

    @Get()
    async getAllFaculties(){
        return await this.facultiesService.getAllFaculties()
    }

}
