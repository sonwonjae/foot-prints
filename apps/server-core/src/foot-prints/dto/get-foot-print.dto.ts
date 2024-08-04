import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class GetFootPrintParamDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  x: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  z: number;
}

export class GetFootPrintQueryDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  range: number;
}
