import { IsEmail, IsString, Matches } from "class-validator";
import { Match } from "src/shared/decorators/match.decorator";

export class RegisterDto {

    @IsString()
    username: string

    @IsEmail()
    @Matches(/^[\w.+-]+@([\w-]+\.)*upr\.ac\.id$/i, {message: 'Email is not a university email'})
    email: string

    @IsString()
    @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {message: "Password too weak"})
    password: string

    @IsString()
    @Match('password', {message: "Confirm password not match"})
    passwordConfirm: string

}