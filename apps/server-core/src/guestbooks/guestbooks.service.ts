import { Injectable } from '@nestjs/common';
import { CreateGuestBookDto } from './dto/create-guestbook.dto';
import { SupabaseService } from 'src/supabase/supabase.service';
import { GetLocationParamDto } from 'src/locations/dto/get-location.dto';
import { Tables } from 'src/supabase/supabase.types';

@Injectable()
export class GuestbooksService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(
    { x, z }: GetLocationParamDto,
    { content }: CreateGuestBookDto,
    user?: Tables<'users'>,
  ) {
    const supabase = this.supabaseService.getClient();

    const { data: guestbook } = await supabase
      .from('guestbooks')
      .insert({
        content,
      })
      .select('*')
      .single();

    const { data: location } = await supabase
      .from('locations')
      .select('*')
      .eq('x', x)
      .eq('z', z)
      .single();

    await supabase.from('guestbooks__locations').insert({
      guestbookId: guestbook.id,
      locationId: location.id,
    });

    if (user) {
      await supabase.from('users__guestbooks').insert({
        userId: user.id,
        guestbookId: guestbook.id,
      });
    }

    return guestbook;
  }

  async findAll({ x, z }: GetLocationParamDto) {
    const supabase = this.supabaseService.getClient();

    const { data: lcoation } = await supabase
      .from('locations')
      .select('*')
      .eq('x', x)
      .eq('z', z)
      .single();

    const { data: guestbooksLocations } = await supabase
      .from('guestbooks__locations')
      .select('*')
      .eq('locationId', lcoation.id);

    const { data: guestbooks } = await supabase
      .from('guestbooks')
      .select(`*`)
      .in(
        'id',
        guestbooksLocations.map(({ guestbookId }) => {
          return guestbookId;
        }),
      );

    return guestbooks;
  }
}
