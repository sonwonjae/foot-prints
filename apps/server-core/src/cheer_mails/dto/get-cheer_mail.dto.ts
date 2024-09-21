import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class GetCheerMailParamDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  x: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  z: number;
}
