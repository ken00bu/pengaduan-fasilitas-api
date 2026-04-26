import { Type } from "class-transformer";
import { IsNumber, IsString, Min, Max } from "class-validator";

export class CreateCategoryDto {

    @IsString()
    name: string;
    
    @Type(() => Number)
    @IsNumber()
    priorityId: number


}