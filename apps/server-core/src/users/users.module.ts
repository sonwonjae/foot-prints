import { MiddlewareConsumer, Module } from '@nestjs/common';

import { SupabaseService } from 'src/supabase/supabase.service';
import { RequiredAuthMiddleware } from 'src/auth/auth.middleware';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService, SupabaseService],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequiredAuthMiddleware).forRoutes(UsersController);
  }
}
