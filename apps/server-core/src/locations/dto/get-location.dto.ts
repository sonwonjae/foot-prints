import { IsInt, IsNotEmpty } from 'class-validator';

export class GetLocationParamDto {
  @IsInt()
  @IsNotEmpty()
  x: number;

  @IsInt()
  @IsNotEmpty()
  z: number;
}

export class GetLocationQueryDto {
  @IsInt()
  @IsNotEmpty()
  range: number;
}
