import { Injectable, BadRequestException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entity/category.entity';
import { Repository } from 'typeorm';
import { UpdateDto } from './dto/update.dto';
import { PriorityService } from 'src/priority/priority.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {

    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        private priorityService: PriorityService
    ){}

    async createCategory(createCategoryDto: CreateCategoryDto){

        const priority = await this.priorityService.findPriorityById(createCategoryDto.priorityId)
        if (!priority) throw new BadRequestException("Priority doesn't exist")
        
        const category = new Category()
        category.name = createCategoryDto.name.toLocaleLowerCase()
        category.priority = {
            id: createCategoryDto.priorityId
        } as any

        try {
            const savedCategory = await this.categoryRepository.save(category)
            return {
                message: "category sucessfully added",
                category: savedCategory
            }
        } catch (error) {
             if (error.code === 'ER_DUP_ENTRY') {
                throw new BadRequestException('Duplicate category');
            }
            throw error
        }
        
        
    }

    async deleteCategory(id: number) {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: { report: true },
        });

        if (!category) throw new NotFoundException('Category tidak ditemukan');
        if (category.isSystem) throw new BadRequestException('Category bawaan sistem tidak bisa dihapus');

        const stillUsed = category.report && category.report.length > 0;

        if (stillUsed) {
            await this.categoryRepository.softRemove(category);
            return { message: 'Category diarsipkan (masih dipakai oleh laporan)' };
        }

        await this.categoryRepository.delete(id);
        return { message: 'Category dihapus permanen' };
    }

    async updateCategory(updateDto: UpdateDto){
        const id = updateDto.id
        const name = updateDto.name
        const priorityId = updateDto.priorityId

        const priority = await this.priorityService.findPriorityById(priorityId)
        if(!priority) throw new BadRequestException("Priority doesn't exist")

        const updatedCategory = await this.categoryRepository.update({id}, {name, priority: { id: priorityId }})
        return {
            messsage: 'Category updated',
            category: updatedCategory
        }
    }

    async findCategoryById(id: number): Promise<Category | null>{
        return await this.categoryRepository.findOne({
            where: {id},
            relations: {
                priority: true
            }
        })
    }

    async getAllCategories(){
        return await this.categoryRepository.find({
            select: {
                id: true,
                name: true,
                priority: true
            },
            relations: {
                priority: true
            }
        })
    }

}
