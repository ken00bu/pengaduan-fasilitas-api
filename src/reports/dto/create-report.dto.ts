import { IsNumber, IsString, Min, Max, ValidateNested, IsNotEmpty, IsNumberString, IsObject, IsOptional, MinLength, MaxLength } from "class-validator";

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
    @MinLength(10)
    @MaxLength(40)
    title: string

    @IsString()
    @MinLength(10)
    @MaxLength(1000)
    description: string

}