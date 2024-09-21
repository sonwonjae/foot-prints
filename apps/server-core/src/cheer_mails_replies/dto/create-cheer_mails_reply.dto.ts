import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { Tables } from 'src/supabase/supabase.types';

export class CreateCheerMailsReplyDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  content: Tables<'cheer_mails_replies'>['content'];
}
