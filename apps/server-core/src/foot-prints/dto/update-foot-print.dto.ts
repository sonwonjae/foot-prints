import { PartialType } from '@nestjs/swagger';
import { CreateFootPrintDto } from './create-foot-print.dto';

export class UpdateFootPrintDto extends PartialType(CreateFootPrintDto) {}
