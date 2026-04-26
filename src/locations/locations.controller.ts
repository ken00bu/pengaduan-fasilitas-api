import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRoles } from 'src/users/entity/user.entity';

@Controller('locations')
export class LocationsController {

    constructor(
        private locationsService: LocationsService
    ){}

    @Get()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles([UserRoles.ADMIN])
    getAllLocations() {
        return this.locationsService.getAllLocations();
    }

}
