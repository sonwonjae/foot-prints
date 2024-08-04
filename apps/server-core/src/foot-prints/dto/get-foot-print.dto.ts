import { IsInt, IsNotEmpty } from 'class-validator';

export class GetFootPrintParamDto {
  @IsInt()
  @IsNotEmpty()
  x: number;

  @IsInt()
  @IsNotEmpty()
  z: number;
}

export class GetFootPrintQueryDto {
  @IsInt()
  @IsNotEmpty()
  range: number;
}
