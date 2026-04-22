import { IsNumber, IsString, IsNotEmpty, IsOptional, IsEnum, IsDate, ValidateIf } from "class-validator";
import { Type, Transform } from "class-transformer";
import { ReportStatus } from "../entity/enum/report-status.enum";
import { SlaStatus } from "../entity/enum/sla-status.enum";

export class UpdateReportDto {

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

    @IsOptional()
    @IsEnum(SlaStatus)
    slaStatus: SlaStatus;

    @Type(()=> Date)
    @IsDate()
    @IsOptional()
    slaDate: Date

    @IsOptional()
    @ValidateIf((_, value) => value !== 'unassign')
    @Transform(({ value }) => value === 'unassign' ? value : Number(value))
    @IsNumber({}, { message: 'harus number atau string "unassign"' })
    assignedTechnicianId: number | null;

    @IsOptional()
    adminNote: string

    @IsOptional()
    priority: string

    @IsOptional()
    reopenedAt: Date

    @IsOptional()
    technicianNote: string

}