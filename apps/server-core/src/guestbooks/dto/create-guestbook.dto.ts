import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { Tables } from 'src/supabase/supabase.types';

export class CreateGuestBookDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  content: Tables<'guestbooks'>['content'];
}
