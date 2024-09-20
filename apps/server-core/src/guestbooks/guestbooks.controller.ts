import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { GuestbooksService } from './guestbooks.service';
import { CreateGuestBookDto } from './dto/create-guestbook.dto';
import { GetLocationParamDto } from 'src/locations/dto/get-location.dto';
import { User } from 'src/users/users.decorator';
import { Tables } from 'src/supabase/supabase.types';

@Controller('guestbooks')
export class GuestbooksController {
  constructor(private readonly guestbooksService: GuestbooksService) {}

  @Post('/:x/:z')
  create(
    @Param() param: GetLocationParamDto,
    @Body() createGuestBookDto: CreateGuestBookDto,
    @User() user?: Tables<'users'>,
  ) {
    return this.guestbooksService.create(param, createGuestBookDto, user);
  }

  @Get('list/:x/:z')
  findAll(@Param() param: GetLocationParamDto) {
    return this.guestbooksService.findAll(param);
  }
}
