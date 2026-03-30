import { IsString, IsEmail, IsNumber, IsOptional } from "class-validator";

export class UpdateDto {

    @IsNumber()
    id: number

    @IsString()
    @IsOptional()
    name: string;

    @IsNumber()
    @IsOptional()
    priorityId: number;

}