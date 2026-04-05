import { Module } from '@nestjs/common';
import { SkillsController } from './skills.controller';
import { AuthModule } from 'src/auth/auth.module';
import { SkillsService } from './skills.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from './entity/skill.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Skill])],
  controllers: [SkillsController],
  providers: [SkillsService]
})
export class SkillsModule {}
