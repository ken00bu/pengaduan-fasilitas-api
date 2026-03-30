import { IsString, IsEmail, IsNumber, IsOptional } from "class-validator";

export class createFacultyDto {

    @IsString()
    name: string

    @IsString()
    code: string

}