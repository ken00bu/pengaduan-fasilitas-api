import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';  
import { Report } from 'src/reports/entity/report.entity';
import { Skill } from 'src/skills/entity/skill.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Report, Skill]), 
    forwardRef(()=> AuthModule)],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
