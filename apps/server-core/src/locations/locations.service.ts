import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import {
  GetLocationParamDto,
  GetLocationQueryDto,
} from './dto/get-location.dto';

@Injectable()
export class LocationsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findLocationListPagination(
    { x, z }: GetLocationParamDto,
    { range }: GetLocationQueryDto,
  ) {
    const supabase = this.supabaseService.getClient();

    const { data: locations } = await supabase.from('locations').select(`*`);

    return (locations || []).map(({ landType, variation, x, z }) => {
      return { landType, variation, location: { x, z } };
    });
  }
}
