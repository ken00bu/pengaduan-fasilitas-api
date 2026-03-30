import { IsNumber, IsString } from "class-validator";

export class CreatePriorityDto {

    @IsString()
    name: string

    @IsNumber()
    slaHours: number

    @IsNumber()
    weight: number

}