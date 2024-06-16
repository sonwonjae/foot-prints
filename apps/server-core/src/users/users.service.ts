import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from 'src/supabase/supabase.service';

import type { Request as ExpressRequest } from 'express';

@Injectable()
export class UsersService {
  private ACCESS_TOKEN_NAME: string;
  private REFRESH_TOKEN_NAME: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {
    this.ACCESS_TOKEN_NAME =
      this.configService.get<string>('ACCESS_TOKEN_NAME');
    this.REFRESH_TOKEN_NAME =
      this.configService.get<string>('REFRESH_TOKEN_NAME');
  }

  async getMe(req: ExpressRequest) {
    const accessToken: string = req.cookies[this.ACCESS_TOKEN_NAME];

    const supabase = this.supabaseService.getClient();

    const { data: authToken } = await supabase
      .from('auth_tokens')
      .select('*')
      .eq('accessToken', accessToken)
      .single();

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', authToken.userId)
      .single();

    return { user };
  }
}
