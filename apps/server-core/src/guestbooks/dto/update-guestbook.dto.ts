import { PartialType } from '@nestjs/swagger';
import { CreateGuestBookDto } from './create-guestbook.dto';

export class UpdateGuestBookDto extends PartialType(CreateGuestBookDto) {}
