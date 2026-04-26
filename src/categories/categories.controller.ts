import { Controller, Post, HttpCode, HttpStatus, UseGuards, Body, Delete, Param, Put, Req, Patch, Get, ParseIntPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateDto } from './dto/update.dto';
import { UserRoles } from 'src/users/entity/user.entity';
import type { Request } from 'express';

@Controller('categories')
export class CategoriesController {

    constructor(
        private categoriesService: CategoriesService
    ){}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Roles([UserRoles.ADMIN])
    @UseGuards(AuthGuard, RolesGuard)
    async createCategory(@Body() addCategoryDto: CreateCategoryDto): Promise<Record<string, any>>{
        return this.categoriesService.createCategory(addCategoryDto)
    }

    @Delete(':id')
    @HttpCode(HttpStatus.CREATED)
    @Roles([UserRoles.ADMIN])
    @UseGuards(AuthGuard, RolesGuard)
    async deleteCategory(@Param('id', ParseIntPipe) id: number){
        return this.categoriesService.deleteCategory(id)
    }

    @Patch(':id')
    @HttpCode(HttpStatus.CREATED)
    @Roles([UserRoles.ADMIN])
    @UseGuards(AuthGuard, RolesGuard)
    async updateCategory(
        @Body() updateDto: UpdateDto
    ){
        return this.categoriesService.updateCategory(updateDto)
    }

    @Get()
    @UseGuards(AuthGuard)
    async getAllCategories(){
        return this.categoriesService.getAllCategories()
    }
        
}
