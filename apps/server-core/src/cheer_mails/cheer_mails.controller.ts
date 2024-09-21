import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CheerMailsService } from './cheer_mails.service';
import { CreateCheerMailDto } from './dto/create-cheer_mail.dto';
import { GetLocationParamDto } from 'src/locations/dto/get-location.dto';
import { Tables } from 'src/supabase/supabase.types';
import { User } from 'src/users/users.decorator';

@Controller('cheer-mails')
export class CheerMailsController {
  constructor(private readonly cheerMailsService: CheerMailsService) {}

  @Post('/:x/:z')
  create(
    @Param() param: GetLocationParamDto,
    @Body() createCheerMailDto: CreateCheerMailDto,
    @User() user?: Tables<'users'>,
  ) {
    return this.cheerMailsService.create(param, createCheerMailDto, user);
  }

  @Get('list/:x/:z')
  findAll(@Param() param: GetLocationParamDto) {
    return this.cheerMailsService.findAll(param);
  }
}
