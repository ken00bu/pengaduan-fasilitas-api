import { IsString, IsOptional, IsNumber } from "class-validator";

export class GetTechniciansSummaryDto {

        @IsString()
        @IsOptional()
        skill: string

}