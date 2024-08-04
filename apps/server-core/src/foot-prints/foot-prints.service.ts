import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateFootPrintDto } from './dto/create-foot-print.dto';
import { UpdateFootPrintDto } from './dto/update-foot-print.dto';
import { SupabaseService } from 'src/supabase/supabase.service';
import { Tables } from 'src/supabase/supabase.types';

@Injectable()
export class FootPrintsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  create(createFootPrintDto: CreateFootPrintDto) {
    console.log({ createFootPrintDto });
    return 'This action adds a new footPrint';
  }

  findAll() {
    return `This action returns all footPrints`;
  }

  findOne(id: number) {
    return `This action returns a #${id} footPrint`;
  }

  async checkAuth(
    /** FIXME: type number로 강제하는 법 찾은 뒤 수정 */
    { x, z }: { x: string; z: string },
    user: Tables<'users'>,
  ) {
    const supabase = this.supabaseService.getClient();

    const { data: location } = await supabase
      .from('locations')
      .select('*')
      .eq('x', Number(x))
      .eq('z', Number(z))
      .single();

    if (!location) {
      throw new ForbiddenException();
    }

    const { data: userLocation } = await supabase
      .from('users__locations')
      .select('*')
      .eq('locationId', location.id)
      .eq('userId', user.id)
      .single();

    if (!userLocation) {
      throw new ForbiddenException();
    }

    return true;
  }

  /** TODO: 땅을 개척할 수 있는지에 대한 여부를 체크하는 로직 더 발전시켜야함 (아직 적용 안했음)
   * 1. 개척만 해두고 발자국은 남기지 않은 땅의 갯수가 [3]개 이상이라면 개척할 수 없음
   * 2. 발자국을 남겼으나 비공개인 발자국이 [10]개 이상이라면 개척할 수 없음
   */
  async checkExist(
    /** FIXME: type number로 강제하는 법 찾은 뒤 수정 */
    { x, z }: { x: string; z: string },
  ) {
    const supabase = this.supabaseService.getClient();

    const { data: location } = await supabase
      .from('locations')
      .select('*')
      .eq('x', Number(x))
      .eq('z', Number(z))
      .single();

    if (!location) {
      throw new ForbiddenException();
    }

    const { data: userLocation } = await supabase
      .from('users__locations')
      .select('*')
      .eq('locationId', location.id)
      .single();

    if (!userLocation) {
      throw new ForbiddenException();
    }

    return true;
  }

  update(id: number, updateFootPrintDto: UpdateFootPrintDto) {
    console.log({ updateFootPrintDto });
    return `This action updates a #${id} footPrint`;
  }

  remove(id: number) {
    return `This action removes a #${id} footPrint`;
  }
}
