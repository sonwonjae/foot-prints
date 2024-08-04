import { Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class LocationsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  create(createLocationDto: CreateLocationDto) {
    console.log({ createLocationDto });
    return 'This action adds a new location';
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

  findOne(id: number) {
    return `This action returns a #${id} location`;
  }

  update(id: number, updateLocationDto: UpdateLocationDto) {
    console.log({ updateLocationDto });
    return `This action updates a #${id} location`;
  }

  remove(id: number) {
    return `This action removes a #${id} location`;
  }
}
