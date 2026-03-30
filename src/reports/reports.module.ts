import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthController } from 'src/auth/auth.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entity/report.entity';
import { ReportsController } from './reports.controller';
import { AuthModule } from 'src/auth/auth.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { R2Module } from 'src/r2/r2.module';
import { LocationsModule } from 'src/locations/locations.module';
import { UsersService } from 'src/users/users.service';
import { PriorityModule } from 'src/priority/priority.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    TypeOrmModule.forFeature([Report]),
    CategoriesModule,
    R2Module,
    LocationsModule,
    UsersModule,
    PriorityModule
  ],
  providers: [ReportsService],
  controllers: [ReportsController]
})
export class ReportsModule {}
