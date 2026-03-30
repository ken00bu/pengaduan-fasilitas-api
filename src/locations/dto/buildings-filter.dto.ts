import { IsBoolean, IsBooleanString, IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";
export class BuildingsFilterDto {

    @IsString()
    @IsOptional()
    name: string

    @IsNumberString()
    @IsOptional()
    floors: number;

    @IsBooleanString()
    @IsOptional()
    isGeneral: string

    @IsString()
    @IsOptional()
    faculty: number

}