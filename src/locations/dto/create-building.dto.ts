import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
export class CreateBuildingDto {

    @IsString()
    name: string

    @IsNumber()
    floors: number;

    @Type(() => Number) 
    @IsNumber()
    @IsOptional()
    facultyId: number

    @IsBoolean()
    @IsOptional()
    isGeneral: boolean

}