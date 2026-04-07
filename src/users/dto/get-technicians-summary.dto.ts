import { IsString, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class GetTechniciansSummaryDto {

        @IsString()
        @IsOptional()
        skill: string

}