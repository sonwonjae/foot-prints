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
import { UpdateLocationDto } from './dto/update-location.dto';
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
  create(
    @Body() createLocationDto: CreateLocationDto,
    @User() user: Tables<'users'>,
  ) {
    return this.locationsService.create(createLocationDto, user);
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
  findOne(@Param() param: GetLocationParamDto) {
    return this.locationsService.findOne(param);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.locationsService.update(+id, updateLocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationsService.remove(+id);
  }
}
