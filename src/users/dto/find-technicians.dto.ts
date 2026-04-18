import { IsNumber, IsString, Min, Max, ValidateNested, IsNotEmpty, IsNumberString, IsObject, IsOptional, ValidateIf, IsEnum, IsBoolean } from "class-validator";
import { Type, Transform } from "class-transformer";

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

        @Type(()=> Number)
        @IsOptional()
        id: number

        @IsString()
        @IsOptional()
        skill: string

        @Transform(({value})=> {
                if (value === 'true') return true
                if (value === 'false') return false
                return value
        })
        @IsBoolean()
        @IsOptional()
        isAssigned: boolean

        @IsString()
        @IsOptional()
        name: string

        @IsEnum(['weight'], {message: 'invalid status'})
        @IsOptional()
        orderBy: string

        @IsString()
        @IsOptional()
        like: string

        @Transform(({value})=> {
                if (value === 'true') return true
                if (value === 'false') return false
                return value
        })
        @IsOptional()
        @IsBoolean()
        filtered: boolean

}