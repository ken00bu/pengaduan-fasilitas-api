import { Module } from '@nestjs/common';
import { PriorityService } from './priority.service';
import { PriorityController } from './priority.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Priority } from './entity/priority.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Priority]), AuthModule],
  providers: [ PriorityService],
  controllers: [PriorityController],
  exports: [PriorityService]
})
export class PriorityModule {}
