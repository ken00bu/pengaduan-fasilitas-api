import { IsNumber, IsString, Min, Max, ValidateNested, IsNotEmpty, IsNumberString, IsObject, IsOptional, ValidateIf, IsEnum } from "class-validator";
import { Transform, Type } from "class-transformer";
import { ReportStatus } from "../entity/enum/report-status.enum";

type ReportStatusWithAll = ReportStatus | 'all';

export class FindReportDto {

    @IsNumberString()
    @IsOptional()
    id: string

    @IsString()
    @IsOptional()
    ticket: string

    @IsString()
    @IsOptional()
    like: string

    @IsString()
    @IsOptional()
    building: string

    @IsString()
    @IsOptional()
    category: string

    @IsString()
    @IsOptional()
    slaStatus: string

    @IsString()
    @IsOptional()
    faculty: string

    @IsString()
    @IsOptional()
    from: string

    @ValidateIf(dto=> dto.limit !== undefined)
    @IsNotEmpty({message: 'Limit need page'})
    @Type(()=> Number)
    @Min(1)
    page: number

    @ValidateIf(dto=> dto.page !== undefined)
    @IsNotEmpty({message: 'Page need limit'})
    @Type(()=> Number)
    @Min(3)
    limit: number

    @IsEnum(['all', ...Object.values(ReportStatus)], {message: 'invalid status'})
    @IsOptional()
    status: ReportStatusWithAll
    
    @IsEnum(['createdAt', 'weight'], {message: 'invalid order by'})
    @IsOptional()
    orderBy: 'createdAt' | 'weight'

    @IsOptional()
    @Transform(({ value }) => value?.toUpperCase() || 'DESC')
    @IsEnum(['DESC', 'ASC'], {message: 'invalid sort order'})
    sortOrder: 'DESC' | 'ASC'

}