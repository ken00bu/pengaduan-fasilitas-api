import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { CreateBuildingDto } from '../dto/create-building.dto';
import { BuildingsService } from './buildings.service';
import { UserRoles } from 'src/users/entity/user.entity';
import { BuildingsFilterDto } from '../dto/buildings-filter.dto';

@Controller('buildings')
export class BuildingsController {

    constructor(
        private buildingService: BuildingsService
    ){}

    @Post()
    @Roles([UserRoles.ADMIN])
    @UseGuards(AuthGuard, RolesGuard)
    async createBuilding( @Body() createBuildingDto: CreateBuildingDto ){
        return await this.buildingService.createBuilding(createBuildingDto)
    }

    @Get()
    async getAllBuildings(
        @Query() BuildingsFilterDto: BuildingsFilterDto
    ){
        return await this.buildingService.findMany(BuildingsFilterDto)
    }
}
