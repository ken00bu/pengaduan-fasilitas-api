import { Body, Controller, Post, Get, HttpCode, HttpStatus, Param, Patch, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
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
        @Body() loginDto: LoginDto): Promise<Record<string, string>>{
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


}
