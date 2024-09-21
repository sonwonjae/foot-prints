import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { CheerMailsRepliesService } from './cheer_mails_replies.service';
import { CheerMailsRepliesController } from './cheer_mails_replies.controller';
import { SupabaseService } from 'src/supabase/supabase.service';
import { OptionalAuthMiddleware } from 'src/auth/auth.middleware';

@Module({
  controllers: [CheerMailsRepliesController],
  providers: [CheerMailsRepliesService, SupabaseService],
})
export class CheerMailsRepliesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(OptionalAuthMiddleware).forRoutes({
      path: ':cheerMailId',
      method: RequestMethod.POST,
    });
  }
}
