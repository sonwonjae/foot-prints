import { PartialType } from '@nestjs/swagger';
import { CreateCheerMailsReplyDto } from './create-cheer_mails_reply.dto';

export class UpdateCheerMailsReplyDto extends PartialType(CreateCheerMailsReplyDto) {}
