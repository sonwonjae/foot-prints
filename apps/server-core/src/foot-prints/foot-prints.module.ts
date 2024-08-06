import { MiddlewareConsumer, Module } from '@nestjs/common';

import { SupabaseService } from 'src/supabase/supabase.service';
import { RequiredAuthMiddleware } from 'src/auth/auth.middleware';

import { FootPrintsService } from './foot-prints.service';
import { FootPrintsController } from './foot-prints.controller';

@Module({
  controllers: [FootPrintsController],
  providers: [FootPrintsService, SupabaseService],
})
export class FootPrintsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequiredAuthMiddleware).forRoutes(FootPrintsController);
  }
}
