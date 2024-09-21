import { Injectable } from '@nestjs/common';
import { CreateCheerMailsReplyDto } from './dto/create-cheer_mails_reply.dto';
import { SupabaseService } from 'src/supabase/supabase.service';
import { Tables } from 'src/supabase/supabase.types';
import { GetCheerMailsReplyParamDto } from './dto/get-cheer_mails_reply.dto';

@Injectable()
export class CheerMailsRepliesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(
    { cheerMailId }: GetCheerMailsReplyParamDto,
    { content }: CreateCheerMailsReplyDto,
    user?: Tables<'users'>,
  ) {
    const supabase = this.supabaseService.getClient();

    const { data: cheerMailsReply } = await supabase
      .from('cheer_mails_replies')
      .insert({ content })
      .select('*')
      .single();

    await supabase.from('cheer_mails__cheer_mails_replies').insert({
      cheerMailId: cheerMailId,
      cheerMailReplyId: cheerMailsReply.id,
    });

    if (user) {
      await supabase.from('users__cheer_mails_replies').insert({
        userId: user.id,
        cheerMailReplyId: cheerMailsReply.id,
      });
    }

    return cheerMailsReply;
  }

  async findAll({ cheerMailId }: GetCheerMailsReplyParamDto) {
    const supabase = this.supabaseService.getClient();

    const { data: cheerMailsCheerMailsReplies } = await supabase
      .from('cheer_mails__cheer_mails_replies')
      .select('*')
      .eq('cheerMailId', cheerMailId);

    const { data: cheerMailsReplies } = await supabase
      .from('cheer_mails_replies')
      .select('*')
      .in(
        'id',
        cheerMailsCheerMailsReplies.map(({ cheerMailReplyId }) => {
          return cheerMailReplyId;
        }),
      );

    return cheerMailsReplies;
  }
}
