import { Injectable } from '@nestjs/common';
import { CreateCheerMailDto } from './dto/create-cheer_mail.dto';
import { GetLocationParamDto } from 'src/locations/dto/get-location.dto';
import { Tables } from 'src/supabase/supabase.types';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class CheerMailsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(
    { x, z }: GetLocationParamDto,
    { title, content }: CreateCheerMailDto,
    user?: Tables<'users'>,
  ) {
    const supabase = this.supabaseService.getClient();

    const { data: cheerMail } = await supabase
      .from('cheer_mails')
      .insert({
        title,
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

    await supabase.from('cheer_mails__locations').insert({
      cheerMailId: cheerMail.id,
      locationId: location.id,
    });

    if (user) {
      await supabase.from('users_cheer_mails').insert({
        userId: user.id,
        cheerMailId: cheerMail.id,
      });
    }

    return cheerMail;
  }

  async findAll({ x, z }: GetLocationParamDto) {
    const supabase = this.supabaseService.getClient();

    const { data: lcoation } = await supabase
      .from('locations')
      .select('*')
      .eq('x', x)
      .eq('z', z)
      .single();

    const { data: cheerMailsLocations } = await supabase
      .from('cheer_mails__locations')
      .select('*')
      .eq('locationId', lcoation.id);

    const { data: cheerMails } = await supabase
      .from('cheer_mails')
      .select(`*`)
      .in(
        'id',
        cheerMailsLocations.map(({ cheerMailId }) => {
          return cheerMailId;
        }),
      );

    return cheerMails;
  }
}
