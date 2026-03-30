import { Controller, Post, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';

@Controller('locations')
export class LocationsController {


}
