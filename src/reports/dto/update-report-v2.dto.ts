import { IsNumber, IsString, Min, Max, ValidateNested, IsNotEmpty, IsNumberString, IsObject, isString, IsOptional } from "class-validator";

export class UpdateReportV2Dto {

    @IsNumberString()
    @IsNotEmpty()
    id: number

    @IsOptional()
    file: any

    @IsNumberString()
    @IsOptional()
    @IsNotEmpty()
    categoryId: number

    //location
    @IsNumberString()
    @IsOptional()
    @IsNotEmpty()
    buildingId: number

    @IsString()
    @IsOptional()
    room: string

    @IsNumberString()
    @IsOptional()
    @IsNotEmpty()
    floor: string

    @IsString()
    @IsOptional()
    detail: string

    @IsString()
    @IsOptional()
    title: string

    @IsString()
    @IsOptional()
    description: string


    @IsString()
    @IsOptional()
    status: string

    @IsString()
    @IsOptional()
    slaStatus: string
    
    @IsOptional()
    assignedTechnicianId: string

    @IsOptional()
    adminNote: string

    @IsOptional()
    priority: string

    @IsOptional()
    technicianNote: string

}