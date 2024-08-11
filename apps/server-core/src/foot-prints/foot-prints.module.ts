import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { SupabaseService } from 'src/supabase/supabase.service';
import {
  RequiredAuthMiddleware,
  OptionalAuthMiddleware,
} from 'src/auth/auth.middleware';

import { FootPrintsService } from './foot-prints.service';
import { FootPrintsController } from './foot-prints.controller';

@Module({
  controllers: [FootPrintsController],
  providers: [FootPrintsService, SupabaseService],
})
export class FootPrintsModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(RequiredAuthMiddleware).forRoutes(FootPrintsController);

    consumer.apply(OptionalAuthMiddleware).forRoutes({
      path: 'foot-prints/article/:x/:z',
      method: RequestMethod.GET,
    });

    consumer.apply(RequiredAuthMiddleware).forRoutes({
      path: 'foot-prints/auth/:x/:z',
      method: RequestMethod.GET,
    });
    consumer.apply(RequiredAuthMiddleware).forRoutes({
      path: 'foot-prints',
      method: RequestMethod.POST,
    });
    consumer.apply(RequiredAuthMiddleware).forRoutes({
      path: 'foot-prints',
      method: RequestMethod.PATCH,
    });
  }
}
