import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { SupabaseService } from 'src/supabase/supabase.service';
import {
  RequiredAuthMiddleware,
  OptionalAuthMiddleware,
} from 'src/auth/auth.middleware';

import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';

@Module({
  controllers: [LocationsController],
  providers: [LocationsService, SupabaseService],
})
export class LocationsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequiredAuthMiddleware).forRoutes({
      path: 'locations',
      method: RequestMethod.POST,
    });

    consumer.apply(OptionalAuthMiddleware).forRoutes({
      path: 'locations/list/:x/:z',
      method: RequestMethod.GET,
    });
  }
}
