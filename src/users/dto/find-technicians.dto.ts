import { IsNumber, IsString, Min, Max, ValidateNested, IsNotEmpty, IsNumberString, IsObject, IsOptional, ValidateIf, IsEnum } from "class-validator";
import { Type } from "class-transformer";

export class FindTechniciansDto {

        // pagination
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

        @IsNumberString()
        @Type(()=> Number)
        @IsOptional()
        id: number

        @IsString()
        @IsOptional()
        skill: string

        @IsString()
        @IsOptional()
        name: string

        @IsEnum(['weight'], {message: 'invalid status'})
        @IsOptional()
        orderBy: string

}