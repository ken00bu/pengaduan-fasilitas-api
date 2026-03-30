import { IsString, IsEmail, IsNumber, IsOptional } from "class-validator";

export class CreateLocationDto {

    @IsNumber()
    buildingId: number

    @IsNumber()
    floor: number
    
    @IsString()
    detail: string

    @IsString()
    room: string

}