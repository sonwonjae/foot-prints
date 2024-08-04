import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { SupabaseService } from 'src/supabase/supabase.service';
import { Tables } from 'src/supabase/supabase.types';
import {
  GetLocationParamDto,
  GetLocationQueryDto,
} from './dto/get-location.dto';

@Injectable()
export class LocationsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createLocationDto: CreateLocationDto, user: Tables<'users'>) {
    const { x, z } = createLocationDto;

    const supabase = this.supabaseService.getClient();

    const { data: location } = await supabase
      .from('locations')
      .select('id')
      .eq('x', x)
      .eq('z', z)
      .single();

    /** NOTE: 생성하기 전에 location을 개척한 사람이 있는지 확인 */
    const { data: otherUserLocation } = await supabase
      .from('users__locations')
      .select('*')
      .eq('locationId', location.id);

    /** NOTE: location을 개척한 사람이 이미 있다면 에러 반환 */
    if (!!otherUserLocation.length) {
      throw new ForbiddenException();
    }

    const { data: userLocation } = await supabase
      .from('users__locations')
      .insert({ locationId: location.id, userId: user.id })
      .select('*')
      .single();

    if (!userLocation) {
      throw new ForbiddenException();
    }

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
      .select('*')
      .gte('x', x - range)
      .lte('x', x + range)
      .gte('z', z - range)
      .lte('z', z + range);

    return locations.map((location) => {
      return {
        location: {
          x: location.x,
          z: location.z,
        },
      };
    });
  }

  /** TODO: 고도화 필요 */
  async findOne({ x, z }: GetLocationParamDto) {
    const supabase = this.supabaseService.getClient();

    const { data: location } = await supabase
      .from('locations')
      .select('id')
      .eq('x', x)
      .eq('z', z)
      .single();

    const { data: userLocation } = await supabase
      .from('users__locations')
      .select('*')
      .eq('locationId', location.id)
      .single();

    if (userLocation) {
      return {
        type: 'mine-location' as const,
      };
    }

    return {
      type: 'empty' as const,
    };
  }

  update(id: number, updateLocationDto: UpdateLocationDto) {
    console.log({ updateLocationDto });
    return `This action updates a #${id} location`;
  }

  remove(id: number) {
    return `This action removes a #${id} location`;
  }
}
