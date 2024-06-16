import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase.types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  private SUPABASE_URL: string;
  private SUPABASE_ANON_KEY: string;
  private readonly supabase: SupabaseClient<Database>;

  constructor(private readonly configService: ConfigService) {
    this.SUPABASE_URL = this.configService.get<string>('SUPABASE_URL');
    this.SUPABASE_ANON_KEY =
      this.configService.get<string>('SUPABASE_ANON_KEY');

    this.supabase = createClient<Database>(
      this.SUPABASE_URL,
      this.SUPABASE_ANON_KEY,
    );
  }

  getClient(): SupabaseClient<Database> {
    return this.supabase;
  }
}
