import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { User } from 'src/users/users.decorator';
import { Tables } from 'src/supabase/supabase.types';
import {
  GetLocationParamDto,
  GetLocationQueryDto,
} from './dto/get-location.dto';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  create(@Body() body: CreateLocationDto, @User() user: Tables<'users'>) {
    return this.locationsService.create(body, user);
  }

  @Get()
  findAll() {
    return this.locationsService.findAll();
  }

  @Get('list/:x/:z')
  findLocationListPagination(
    @Param() param: GetLocationParamDto,
    @Query() query: GetLocationQueryDto,
    @User() user: Tables<'users'>,
  ) {
    return this.locationsService.findLocationListPagination(param, query, user);
  }

  @Get(':x/:z')
  findOne(@Param() param: GetLocationParamDto, @User() user?: Tables<'users'>) {
    return this.locationsService.findOne(param, user);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.locationsService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationsService.remove(+id);
  }
}
