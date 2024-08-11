import { IsBoolean, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateFootPrintDto {
  @IsInt()
  @IsNotEmpty()
  x: number;

  @IsInt()
  @IsNotEmpty()
  z: number;

  @IsBoolean()
  @IsNotEmpty()
  isPublic: boolean;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
