import { IsEmail, IsOptional, IsString } from "class-validator"

export class CreateUnverifiedUserDto {

    @IsEmail()
    email: string

    @IsString()
    userType

}