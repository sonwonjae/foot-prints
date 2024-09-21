import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CheerMailsRepliesService } from './cheer_mails_replies.service';
import { CreateCheerMailsReplyDto } from './dto/create-cheer_mails_reply.dto';
import { Tables } from 'src/supabase/supabase.types';
import { User } from 'src/users/users.decorator';
import { GetCheerMailsReplyParamDto } from './dto/get-cheer_mails_reply.dto';

@Controller('cheer-mails-replies')
export class CheerMailsRepliesController {
  constructor(
    private readonly cheerMailsRepliesService: CheerMailsRepliesService,
  ) {}

  @Post('/:cheerMailId')
  create(
    @Param() param: GetCheerMailsReplyParamDto,
    @Body() createCheerMailsReplyDto: CreateCheerMailsReplyDto,
    @User() user?: Tables<'users'>,
  ) {
    return this.cheerMailsRepliesService.create(
      param,
      createCheerMailsReplyDto,
      user,
    );
  }

  @Get('/list/:cheerMailId')
  findAll(@Param() param: GetCheerMailsReplyParamDto) {
    return this.cheerMailsRepliesService.findAll(param);
  }
}
