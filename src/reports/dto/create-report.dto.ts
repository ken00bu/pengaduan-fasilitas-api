import { IsNumber, IsString, Min, Max, ValidateNested, IsNotEmpty, IsNumberString, IsObject, IsOptional } from "class-validator";

export class CreateReportDto {

    @IsNumberString()
    @IsNotEmpty()
    categoryId: number

    @IsNumberString()
    @IsNotEmpty()
    buildingId: number

    @IsString()
    @IsNotEmpty()
    room: string

    @IsNumberString()
    @IsNotEmpty()
    floor: string

    @IsString()
    detail: string

    @IsString()
    @IsOptional()
    title: string

    @IsString()
    description: string

}