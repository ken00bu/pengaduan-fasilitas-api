import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entity/category.entity';
import { CategoriesController } from './categories.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PriorityModule } from 'src/priority/priority.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    AuthModule,
    PriorityModule
  ],
  providers: [
    CategoriesService
  ],
  controllers: [CategoriesController],
  exports: [CategoriesService]
})
export class CategoriesModule {}
