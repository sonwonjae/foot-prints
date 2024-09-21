import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetCheerMailsReplyParamDto {
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  cheerMailId: string;
}
