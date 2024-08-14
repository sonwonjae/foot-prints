import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FootPrintsService } from './foot-prints.service';
import { CreateFootPrintDto } from './dto/create-foot-print.dto';
import { UpdateFootPrintDto } from './dto/update-foot-print.dto';
import { User } from 'src/users/users.decorator';
import { Tables } from 'src/supabase/supabase.types';
import { GetFootPrintParamDto } from './dto/get-foot-print.dto';

@Controller('foot-prints')
export class FootPrintsController {
  constructor(private readonly footPrintsService: FootPrintsService) {}

  @Get()
  findAll() {
    return this.footPrintsService.findAll();
  }

  @Get('article/:x/:z')
  findOne(@Param() param: GetFootPrintParamDto) {
    return this.footPrintsService.getArticle(param);
  }

  @Get('auth/:x/:z')
  checkAuth(
    @Param() param: GetFootPrintParamDto,
    @User() user: Tables<'users'>,
  ) {
    return this.footPrintsService.checkAuth(param, user);
  }

  @Get('exist/:x/:z')
  check(@Param() param: GetFootPrintParamDto) {
    return this.footPrintsService.checkExist(param);
  }

  @Post()
  create(@Body() body: CreateFootPrintDto, @User() user: Tables<'users'>) {
    return this.footPrintsService.create(body, user);
  }

  @Patch()
  update(@Body() body: UpdateFootPrintDto, @User() user: Tables<'users'>) {
    return this.footPrintsService.update(body, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.footPrintsService.remove(+id);
  }
}
