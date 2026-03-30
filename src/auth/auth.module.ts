import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { createTransport } from 'nodemailer'
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesGuard } from './guard/roles.guard';
import { AuthGuard } from './guard/auth.guard';

//aku harus memulai dari integrasi typeORM, membuat model database.
//kemudian integrasi nest/jwt, dan bikin fitur sign-in
//lalu integrasi email sender, dan bikin fitur sign-up

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService)=>({
        secret: configService.get<string>('JWT_SECRET')
      })
    })
  ],
  providers: [
    AuthService,
    RolesGuard,
    AuthGuard,
    {
      provide: 'NODEMAILER',
      inject: [ConfigService],
      useFactory: (configService: ConfigService)=>{
        return createTransport({
          host: "smtp-relay.brevo.com",
          port: 587,
          secure: false, 
          auth: {
            user: configService.get<string>('BREVO_ACC'),
            pass: configService.get<string>('BREVO_PASS'),
          }
        })
      }
    },
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    RolesGuard,
    AuthGuard
  ]
})
export class AuthModule {}
