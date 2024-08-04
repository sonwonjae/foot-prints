import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { SupabaseService } from 'src/supabase/supabase.service';
import { Tables } from 'src/supabase/supabase.types';

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
    /** FIXME: type number로 강제하는 법 찾은 뒤 수정 */
    { x, z }: { x: string; z: string },
    { range = '0' }: { range: string },
  ) {
    const supabase = this.supabaseService.getClient();

    const { data: locations } = await supabase
      .from('locations')
      .select('*')
      .gte('x', Number(x) - Number(range))
      .lte('x', Number(x) + Number(range))
      .gte('z', Number(z) - Number(range))
      .lte('z', Number(z) + Number(range));

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
  async findOne(
    /** FIXME: type number로 강제하는 법 찾은 뒤 수정 */
    { x, z }: { x: string; z: string },
  ) {
    const supabase = this.supabaseService.getClient();

    const { data: location } = await supabase
      .from('locations')
      .select('id')
      .eq('x', Number(x))
      .eq('z', Number(z))
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
