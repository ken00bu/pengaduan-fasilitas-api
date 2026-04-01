import { HttpCode, Inject } from '@nestjs/common';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import type { Transporter } from 'nodemailer'
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        @Inject('NODEMAILER')
        private transporter: Transporter,
        private jwtService: JwtService
    ){}

    //method register user biasa
    async register(registerDto: RegisterDto){

        const username = registerDto.username
        const email = registerDto.email
        const password = registerDto.password
        const user = await this.usersService.findUserByEmail(email)
        const isVerified = user?.email_is_verified

        if ( user && isVerified ) throw new HttpException('User with email already exist', HttpStatus.FORBIDDEN)
          
        const userType = /@.*mhs/i.test(email) ? 'mahasiswa' : 'staff'

        if ( !user ) {
            await this.usersService.createUnverifiedUser({email, userType })
        } 

        try {
            await this.sendEmailVerificationLink(email, await this.createTokenLink({ email, password, username }))
        } catch (error) {
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
        }

        return {
            message: "Verification link has been sent, please check your email"
        }

    }

    async verifyEmail(response, token: string){
        const userPayload =  await this.jwtService.verify(token)
        const email = userPayload.email
        const password = userPayload.password
        const username = userPayload.username

        if(!token) throw new HttpException('You must have a token', HttpStatus.BAD_REQUEST)

        //kalau emailnya udah verified berarti gak perlu lagi pake method ini
        if (await this.usersService.isEmailExistAndVerified(email)) throw new HttpException('User already Exist', HttpStatus.FORBIDDEN)
        await this.usersService.completeUserVerification({email, password: await bcrypt.hash(password, await bcrypt.genSalt()), username})
        const user = await this.usersService.findUserByEmail(email)
        if (!user) throw new HttpException('Invalid credentials', HttpStatus.NOT_FOUND)

        const payload = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role
        }

        const accessToken = this.jwtService.sign(payload)
        response.cookie('access_token', accessToken, { httpOnly: true })
        response.cookie('user_profile', {
            username: user.username,
            role: user.role,
            email: user.email
        })
        return {
            message: 'Login using link successfully '
        }
    }

    async sendEmailVerificationLink(email: string, token?: string){
        return await this.transporter.sendMail({
                from: "fixit.system.noreply@gmail.com",
                to: email,
                subject: "Verifikasi Email Fixit! hewo",
                html: `
                    <h1>Verifikasi Akun Fixit Kamu</h1>
                    <p>hai ini pesan verifikasi<p>Halo,</p>

                    <p>Terima kasih sudah mendaftar.</p>

                    <p>Silakan klik link verifikasi di bawah ini:</p>

                    <p>
                        <a href="http://localhost:3000/login?token=${token}" 
                        style="color: #1a73e8; word-break: break-all;">
                        Verifikasi
                        </a>
                    </p>

                    <p>Jika kamu tidak merasa mendaftar, abaikan email ini.</p>

                    <p>
                        Terima kasih,<br>
                        <strong>Tim Fixit</strong>
                    </p>
                `
            })
    }

    async createTokenLink(emailVerifyData: Record<string, string>): Promise<string>{
        return await this.jwtService.sign(emailVerifyData)
    }

    validateUser(request): boolean{
        const cookies = request.cookies;
        const token = cookies?.access_token;
        if(!token) return false;

        const user = this.jwtService.verify(token)
        console.log(user)
        if (!user) return false;

        request.user = {
            id: user.id,
            email: user.email,
            role: user.role,
        }
        return true
    }

    async login(response, loginDto: LoginDto): Promise<Record<string, string>>{
        const email = loginDto.email
        const user = await this.usersService.findUserByEmail(email)
        if (!user) throw new HttpException('Invalid credentials', HttpStatus.NOT_FOUND)
        console.log(user, ' dia lagi login')
        const hashed_password = user.hashed_password
        const plain_password = loginDto.password
        if (!await bcrypt.compare(plain_password, hashed_password)) throw new HttpException('Invalid credentials', HttpStatus.NOT_FOUND)
        
        const payload = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role
        }

        const token = this.jwtService.sign(payload)
        response.cookie('access_token', token, { httpOnly: true })

        return {
            message: 'Login successfully'
        }
    }


}
