import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { Tables } from 'src/supabase/supabase.types';

export class CreateCheerMailDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  title: Tables<'cheer_mails'>['title'];

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  content: Tables<'cheer_mails'>['content'];
}
