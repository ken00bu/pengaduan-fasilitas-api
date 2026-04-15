import { IsEmail, IsNumber, IsString, Matches } from "class-validator";
import { Match } from "src/shared/decorators/match.decorator";

export class CreateTechnicianDto {

    @IsString()
    username: string

    @IsEmail()
    @Matches(/^[\w.+-]+@([\w-]+\.)*upr\.ac\.id$/i, {message: 'Email is not a university email'})
    email: string

    @IsNumber()
    skillId: number

    @IsString()
    @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {message: "Password too weak"})
    password: string


}