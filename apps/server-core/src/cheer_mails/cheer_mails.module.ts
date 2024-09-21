import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { CheerMailsService } from './cheer_mails.service';
import { CheerMailsController } from './cheer_mails.controller';
import { SupabaseService } from 'src/supabase/supabase.service';
import { OptionalAuthMiddleware } from 'src/auth/auth.middleware';

@Module({
  controllers: [CheerMailsController],
  providers: [CheerMailsService, SupabaseService],
})
export class CheerMailsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(OptionalAuthMiddleware).forRoutes({
      path: 'cheer-mails/:x/:z',
      method: RequestMethod.POST,
    });
  }
}
