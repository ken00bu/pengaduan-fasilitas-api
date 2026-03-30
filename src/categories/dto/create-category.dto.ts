import { IsNumber, IsString, Min, Max } from "class-validator";

export class CreateCategoryDto {

    @IsString()
    name: string;

    @IsNumber()
    priority: number


}