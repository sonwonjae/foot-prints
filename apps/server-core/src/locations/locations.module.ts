import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { SupabaseService } from 'src/supabase/supabase.service';
import { AuthMiddleware } from 'src/auth/auth.middleware';

import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';

@Module({
  controllers: [LocationsController],
  providers: [LocationsService, SupabaseService],
})
export class LocationsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: 'locations',
      method: RequestMethod.POST,
    });
  }
}
