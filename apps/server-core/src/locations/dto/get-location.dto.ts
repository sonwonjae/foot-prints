import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class GetLocationParamDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  x: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  z: number;
}

export class GetLocationQueryDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  range: number;
}
