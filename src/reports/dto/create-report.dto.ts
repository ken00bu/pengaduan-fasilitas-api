import { IsNumber, IsString, Min, Max, ValidateNested, IsNotEmpty, IsNumberString, IsObject } from "class-validator";

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
    description: string

}