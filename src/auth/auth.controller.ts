import { Body, Controller, Post, Get, HttpCode, HttpStatus, Param, Patch, Res, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from 'src/users/type/user.type';
import { AuthGuard } from './guard/auth.guard';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {


    constructor(
        private authService: AuthService,
    ){}

    @Post('/register')
    @HttpCode(HttpStatus.CREATED)
    async register( @Body() registerDto: RegisterDto): Promise<Record<string, string>>{
        console.log('register request masuk')
        return await this.authService.register(registerDto)
    }

    @Patch('/verify/:token')
    @HttpCode(HttpStatus.ACCEPTED)
    async verifyEmail(
        @Res({passthrough: true}) response: Response,
        @Param('token') token: string,
    ){
        return await this.authService.verifyEmail(response, token)
    }

    @Post('/login')
    @HttpCode(HttpStatus.ACCEPTED)
    async login( 
        @Res({passthrough: true}) response: Response,
        @Body() loginDto: LoginDto): Promise<Record<string, any>>{
        return await this.authService.login(response, loginDto)
    }

    @Post('/logout')
    async logout(
        @Res({passthrough: true}) response: Response
    ){
        console.log('logout request masuk')
        response.clearCookie('access_token');
        return {message: 'Logged out successfully'};
    }

    @Patch('change-password')
    @UseGuards(AuthGuard)
    async changePassword(
        @CurrentUser() currentUser: User,
        @Body() dto: ChangePasswordDto,
    ) {
        return this.authService.changePassword(currentUser.id, dto);
    }


}
