import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { LocationsModule } from './locations/locations.module';
import { R2Module } from './r2/r2.module';
import { PriorityModule } from './priority/priority.module';

//entity
import { User } from './users/entity/user.entity';
import { Category } from './categories/entity/category.entity';
import { Report } from './reports/entity/report.entity';
import { Location } from './locations/entity/location.entity';
import { Building } from './locations/entity/building.entity';
import { Faculty } from './locations/entity/faculty.entity';
import { AspirationsModule } from './aspirations/aspirations.module';
import { Aspiration } from './aspirations/entity/aspiration.entity';
import { Priority } from './priority/entity/priority.entity';
import { SkillsModule } from './skills/skills.module';
import { Skill } from './skills/entity/skill.entity';

@Module({
  imports: [
    AuthModule, 
    ReportsModule, 
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_USE'),
        entities: [User, Category, Report, Building, Location, Faculty, Aspiration, Priority, Skill],
        synchronize: true
      })
    }),
    CategoriesModule,
    LocationsModule,
    AspirationsModule,
    R2Module,
    PriorityModule,
    SkillsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}