import { Module } from '@nestjs/common';

import { SupabaseService } from 'src/supabase/supabase.service';

import { FootPrintsService } from './foot-prints.service';
import { FootPrintsController } from './foot-prints.controller';

@Module({
  controllers: [FootPrintsController],
  providers: [FootPrintsService, SupabaseService],
})
export class FootPrintsModule {}
