import { Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { SupabaseService } from 'src/supabase/supabase.service';
import { Tables } from 'src/supabase/supabase.types';
import {
  GetLocationParamDto,
  GetLocationQueryDto,
} from './dto/get-location.dto';

@Injectable()
export class LocationsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(body: CreateLocationDto, user: Tables<'users'>) {
    const { x, z } = body;

    const supabase = this.supabaseService.getClient();
    console.log(user, supabase, x, z);

    return true;
  }

  findAll() {
    return `This action returns all locations`;
  }

  async findLocationListPagination(
    { x, z }: GetLocationParamDto,
    { range }: GetLocationQueryDto,
  ) {
    const supabase = this.supabaseService.getClient();

    const { data: locations } = await supabase
      .from('locations')
      .select(`*`)
      .gte('x', x - 1)
      .lte('x', x + Math.floor(range))
      .gte('z', z - 1)
      .lte('z', z + Math.floor(range));

    return (locations || []).map(({ landType, variation, x, z }) => {
      return { landType, variation, location: { x, z } };
    });
  }

  async findOne({ x, z }: GetLocationParamDto) {
    console.log({ x, z });
    return {
      type: 'empty' as const,
    };
  }

  update(id: number) {
    return `This action updates a #${id} location`;
  }

  remove(id: number) {
    return `This action removes a #${id} location`;
  }
}
