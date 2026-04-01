import { IsNumber, IsString, Min, Max, ValidateNested, IsNotEmpty, IsNumberString, IsObject, IsOptional, IsEnum } from "class-validator";
import { Transform } from "class-transformer";
import { ReportStatus } from "../entity/enum/report-status.enum";

class Location {

    @IsNumberString()
    buildingId: number

    @IsString()
    room: string

    @IsString()
    detail: string

    @IsNumberString()
    floor: string

}

export class UpdateReportDto {

    @IsNumber({}, {message: 'Report ID is required.'})
    reportId: number

    @IsNumber()
    @IsOptional()
    categoryId: number

    @ValidateNested()
    location: Location

    @IsString()
    @IsOptional()
    @Transform(({ value }) => ("" + value).toLowerCase())
    @IsEnum(ReportStatus)
    status: string

    @IsString()
    @IsOptional()
    title: string

    @IsString()
    @IsOptional()
    description: string

    @IsString()
    @IsOptional()
    adminNote: string

    @IsString()
    @IsOptional()
    technicianNote: string

    @IsNumber()
    @IsOptional()
    priority: number

    @IsNumber()
    @IsOptional()
    assignedTechnicianId: number

}