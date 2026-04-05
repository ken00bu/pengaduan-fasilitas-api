import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';  

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), 
    forwardRef(()=> AuthModule)],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
