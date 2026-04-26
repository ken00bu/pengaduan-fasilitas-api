import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty()
    oldPassword: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {message: "Password too weak"})
    newPassword: string;
}