import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { LocationsController } from './locations.controller';

@Module({
  controllers: [LocationsController],
  providers: [LocationsService, SupabaseService],
})
export class LocationsModule {}
