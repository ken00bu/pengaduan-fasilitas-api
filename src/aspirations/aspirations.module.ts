import { Module } from '@nestjs/common';
import { AspirationsService } from './aspirations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from 'src/reports/entity/report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report])
  ],
  providers: [
    AspirationsService,
  ]
})
export class AspirationsModule {}
