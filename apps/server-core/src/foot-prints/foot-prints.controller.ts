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
