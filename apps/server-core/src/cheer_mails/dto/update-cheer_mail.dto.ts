import { PartialType } from '@nestjs/swagger';
import { CreateCheerMailDto } from './create-cheer_mail.dto';

export class UpdateCheerMailDto extends PartialType(CreateCheerMailDto) {}
