import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "../auth.service";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthService) {}
    
    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        console.log('seseorang request')
        const request = context.switchToHttp().getRequest();    
        return this.authService.validateUser(request);
    }
}