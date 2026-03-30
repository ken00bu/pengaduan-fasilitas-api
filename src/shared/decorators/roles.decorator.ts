import { Reflector } from '@nestjs/core';
import { UserRoles } from 'src/users/entity/user.entity';

export const Roles = Reflector.createDecorator<UserRoles[]>();
