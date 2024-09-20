import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { GuestbooksService } from './guestbooks.service';
import { GuestbooksController } from './guestbooks.controller';
import { SupabaseService } from 'src/supabase/supabase.service';
import { OptionalAuthMiddleware } from 'src/auth/auth.middleware';

@Module({
  controllers: [GuestbooksController],
  providers: [GuestbooksService, SupabaseService],
})
export class GuestbooksModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(OptionalAuthMiddleware).forRoutes({
      path: 'guestbooks/:x/:z',
      method: RequestMethod.POST,
    });
  }
}
