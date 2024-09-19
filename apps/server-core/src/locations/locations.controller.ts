import { Controller, Get, Param, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';
import {
  GetLocationParamDto,
  GetLocationQueryDto,
} from './dto/get-location.dto';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('list/:x/:z')
  findLocationListPagination(
    @Param() param: GetLocationParamDto,
    @Query() query: GetLocationQueryDto,
  ) {
    return this.locationsService.findLocationListPagination(param, query);
  }
}
