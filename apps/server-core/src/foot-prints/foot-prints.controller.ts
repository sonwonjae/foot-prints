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

@Controller('foot-prints')
export class FootPrintsController {
  constructor(private readonly footPrintsService: FootPrintsService) {}

  @Post()
  create(@Body() createFootPrintDto: CreateFootPrintDto) {
    return this.footPrintsService.create(createFootPrintDto);
  }

  @Get()
  findAll() {
    return this.footPrintsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.footPrintsService.findOne(+id);
  }

  @Get('auth/:x/:z')
  checkAuth(
    @Param() param: { x: string; z: string },
    @User() user: Tables<'users'>,
  ) {
    return this.footPrintsService.checkAuth(param, user);
  }

  @Get('exist/:x/:z')
  check(@Param() param: { x: string; z: string }) {
    return this.footPrintsService.checkExist(param);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFootPrintDto: UpdateFootPrintDto,
  ) {
    return this.footPrintsService.update(+id, updateFootPrintDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.footPrintsService.remove(+id);
  }
}
