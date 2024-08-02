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

  async findLocationListPagination(x: number, z: number) {
    const supabase = this.supabaseService.getClient();

    const { data: locations } = await supabase.from('locations').select('*');

    console.log(`x: ${x}`, `z: ${z}`);
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
