import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { User } from './type/user.type';
import { FindTechniciansDto } from './dto/find-technicians.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {

    constructor(
        private usersService: UsersService
    ){}

    @Get('technicians')
    @UseGuards(AuthGuard)
    async findTechnicians(
        @Query() dto: FindTechniciansDto,
        @CurrentUser() currentUser: User
    ) {
        return await this.usersService.findManyTechnicians(dto, currentUser)
    }

}
