import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateLocationDto {
  @IsInt()
  @IsNotEmpty()
  x: number;

  @IsInt()
  @IsNotEmpty()
  z: number;
}
