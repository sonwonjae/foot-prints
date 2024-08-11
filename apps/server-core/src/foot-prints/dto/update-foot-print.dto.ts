import { PartialType } from '@nestjs/swagger';
import { CreateFootPrintDto } from './create-foot-print.dto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateFootPrintDto extends PartialType(CreateFootPrintDto) {
  @IsInt()
  @IsNotEmpty()
  x: number;

  @IsInt()
  @IsNotEmpty()
  z: number;
}
