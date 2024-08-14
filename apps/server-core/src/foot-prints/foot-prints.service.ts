import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateFootPrintDto } from './dto/create-foot-print.dto';
import { UpdateFootPrintDto } from './dto/update-foot-print.dto';
import { SupabaseService } from 'src/supabase/supabase.service';
import { Tables } from 'src/supabase/supabase.types';
import { GetFootPrintParamDto } from './dto/get-foot-print.dto';

@Injectable()
export class FootPrintsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  findAll() {
    return `This action returns all footPrints`;
  }

  async getArticle({ x, z }: GetFootPrintParamDto) {
    const supabase = this.supabaseService.getClient();

    const { data: location } = await supabase
      .from('locations')
      .select('*')
      .eq('x', x)
      .eq('z', z)
      .single();

    if (!location) {
      throw new ForbiddenException();
    }

    const { data: footPrintLocation } = await supabase
      .from('foot_prints__locations')
      .select('*')
      .eq('locationId', location.id)
      .single();

    if (!footPrintLocation) {
      return null;
    }

    const { data: footPrint } = await supabase
      .from('foot_prints')
      .select('*')
      .eq('id', footPrintLocation.footPrintId)
      .single();

    return footPrint;
  }

  async checkAuth({ x, z }: GetFootPrintParamDto, user: Tables<'users'>) {
    const supabase = this.supabaseService.getClient();

    const { data: location } = await supabase
      .from('locations')
      .select('*')
      .eq('x', x)
      .eq('z', z)
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
  async checkExist({ x, z }: GetFootPrintParamDto) {
    const supabase = this.supabaseService.getClient();

    const { data: location } = await supabase
      .from('locations')
      .select('*')
      .eq('x', x)
      .eq('z', z)
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
  async create(body: CreateFootPrintDto, user: Tables<'users'>) {
    const { x, z, isPublic, title, description, content } = body;

    const supabase = this.supabaseService.getClient();

    const { data: location } = await supabase
      .from('locations')
      .select('id')
      .eq('x', x)
      .eq('z', z)
      .single();

    /** NOTE: 생성하기 전에 내가 개척한 땅이 맞는지 확인 */
    const { data: userLocation } = await supabase
      .from('users__locations')
      .select('*')
      .eq('userId', user.id)
      .eq('locationId', location.id)
      .single();

    /** NOTE: 내가 개척한 땅이 아니라면 에러 반환 */
    if (!userLocation) {
      throw new ForbiddenException();
    }

    /** NOTE: 생성하려는 땅에 이미 쓴 글이 있는지 확인 */
    const { data: footPrintLocation } = await supabase
      .from('foot_prints__locations')
      .select('*')
      .eq('locationId', location.id)
      .single();

    /** NOTE: 생성하려는 땅에 이미 쓴 글이 있다면 에러 반환 */
    if (footPrintLocation) {
      throw new ForbiddenException();
    }

    const { data: myFootPrint } = await supabase
      .from('foot_prints')
      .insert({
        isPublic,
        title,
        description,
        content,
      })
      .select('*')
      .single();

    const { data: myFootPrintLocation } = await supabase
      .from('foot_prints__locations')
      .insert({
        locationId: location.id,
        footPrintId: myFootPrint.id,
      })
      .select('*')
      .single();

    const { data: myUserFootPrint } = await supabase
      .from('users__foot_prints')
      .insert({
        userId: user.id,
        footPrintId: myFootPrint.id,
      })
      .select('*')
      .single();

    /** NOTE: 관계 DB에 정상적으로 insert되지 않았다면 에러 반환 */
    if (!myFootPrintLocation || !myUserFootPrint) {
      throw new ForbiddenException();
    }

    return true;
  }

  async update(body: UpdateFootPrintDto, user: Tables<'users'>) {
    const { x, z, isPublic, title, description, content } = body;

    const supabase = this.supabaseService.getClient();

    const { data: location } = await supabase
      .from('locations')
      .select('id')
      .eq('x', x)
      .eq('z', z)
      .single();

    /** NOTE: 생성하기 전에 내가 개척한 땅이 맞는지 확인 */
    const { data: userLocation } = await supabase
      .from('users__locations')
      .select('*')
      .eq('userId', user.id)
      .eq('locationId', location.id)
      .single();

    /** NOTE: 내가 개척한 땅이 아니라면 에러 반환 */
    if (!userLocation) {
      throw new ForbiddenException();
    }

    /** NOTE: 땅에 발자국이 내 발자국인지 확인 */
    const { data: footPrintLocation } = await supabase
      .from('foot_prints__locations')
      .select('*')
      .eq('locationId', location.id)
      .single();
    const { data: userFootPrint } = await supabase
      .from('users__foot_prints')
      .select('*')
      .eq('footPrintId', footPrintLocation.footPrintId)
      .eq('userId', user.id)
      .single();

    /** NOTE: 내 발자국이 아니라면 에러 반환 */
    if (!userFootPrint) {
      throw new ForbiddenException();
    }

    /** NOTE: 모든 유효성 검증을 끝냈다면 업데이트 가능 */
    const { data: myFootPrint } = await supabase
      .from('foot_prints')
      .update({
        ...(typeof isPublic !== 'undefined' && { isPublic }),
        ...(typeof title !== 'undefined' && { title }),
        ...(typeof description !== 'undefined' && { description }),
        ...(typeof content !== 'undefined' && { content }),
      })
      .eq('id', userFootPrint.footPrintId)
      .select('*')
      .single();

    return myFootPrint;
  }

  remove(id: number) {
    return `This action removes a #${id} footPrint`;
  }
}
