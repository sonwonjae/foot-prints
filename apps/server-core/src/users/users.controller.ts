import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.decorator';
import { Tables } from 'src/supabase/supabase.types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@User() user: Tables<'users'>) {
    return { user };
  }
}
