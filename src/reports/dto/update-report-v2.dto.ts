import { IsNumber, IsString, IsNotEmpty, IsOptional, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { ReportStatus } from "../entity/enum/report-status.enum";

export class UpdateReportV2Dto {

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    id: number

    @IsOptional()
    file: any

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @IsNotEmpty()
    categoryId: number

    //location
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @IsNotEmpty()
    buildingId: number

    @IsString()
    @IsOptional()
    room: string

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @IsNotEmpty()
    floor: number

    @IsString()
    @IsOptional()
    detail: string

    @IsString()
    @IsOptional()
    title: string

    @IsString()
    @IsOptional()
    description: string


    @IsEnum(ReportStatus)
    @IsOptional()
    status: ReportStatus

    @IsString()
    @IsOptional()
    slaStatus: string
    
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    assignedTechnicianId: number

    @IsOptional()
    adminNote: string

    @IsOptional()
    priority: string

    @IsOptional()
    technicianNote: string

}