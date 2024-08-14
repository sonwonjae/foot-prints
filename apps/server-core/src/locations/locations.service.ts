import { ForbiddenException, Injectable } from '@nestjs/common';
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

    const { data: location } = await supabase
      .from('locations')
      .select('id')
      .eq('x', x)
      .eq('z', z)
      .single();

    /** NOTE: 생성하기 전에 location을 개척한 사람이 있는지 확인 */
    const { data: anyUserLocation } = await supabase
      .from('users__locations')
      .select('*')
      .eq('locationId', location.id);

    /** NOTE: location을 개척한 사람이 이미 있다면 에러 반환 */
    if (!!anyUserLocation.length) {
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
    user: Tables<'users'>,
  ) {
    const supabase = this.supabaseService.getClient();

    const { data: locations } = await supabase
      .from('locations')
      .select(
        `*, 
        users__locations ( userId )
        `,
      )
      .gte('x', x - Math.floor(range / 2))
      .lte('x', x + Math.floor(range / 2))
      .gte('z', z - Math.floor(range / 2))
      .lte('z', z + Math.floor(range / 2));

    return (locations || []).map((location) => {
      /** NOTE: users__locations는 무조건 하나만 존재해야 함 */
      const { userId } = location.users__locations?.[0] || {};

      if (userId) {
        if (user?.id === userId) {
          return {
            type: 'mine-location' as const,
            location: {
              x: location.x,
              z: location.z,
            },
          };
        } else {
          return {
            type: 'other-user-location' as const,
            location: {
              x: location.x,
              z: location.z,
            },
          };
        }
      }

      return {
        type: 'empty' as const,
        location: {
          x: location.x,
          z: location.z,
        },
      };
    });
  }

  async findOne({ x, z }: GetLocationParamDto, user?: Tables<'users'>) {
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
      if (userLocation.userId === user?.id) {
        return {
          type: 'mine-location' as const,
        };
      } else {
        return {
          type: 'other-user-location' as const,
        };
      }
    }

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
