import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { AuthModule } from 'src/auth/auth.module';
import { FacultiesController } from './faculties/faculties.controller';
import { FacultiesService } from './faculties/faculties.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faculty } from './entity/faculty.entity';
import { Building } from './entity/building.entity';
import { Location } from './entity/location.entity';
import { BuildingsController } from './buildings/buildings.controller';
import { BuildingsService } from './buildings/buildings.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Faculty, Building, Location])
  ],
  providers: [LocationsService, FacultiesService, BuildingsService],
  controllers: [LocationsController, FacultiesController, BuildingsController],
  exports: [LocationsService, FacultiesService, BuildingsService]
})
export class LocationsModule {}