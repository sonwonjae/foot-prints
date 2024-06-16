import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { SupabaseService } from 'src/supabase/supabase.service';
import { Tables } from 'src/supabase/supabase.types';
import { v4 as uuidv4 } from 'uuid';

interface RequestWithUser extends Request {
  user: Tables<'users'>;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
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

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    const accessToken = req.cookies[this.ACCESS_TOKEN_NAME] as string;
    const refreshToken = req.cookies[this.REFRESH_TOKEN_NAME] as string;

    const supabase = this.supabaseService.getClient();

    if (accessToken) {
      const { data: authToken } = await supabase
        .from('auth_tokens')
        .select('*')
        .eq('accessToken', accessToken)
        .single();

      if (!authToken) {
        throw new ForbiddenException();
      }

      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', authToken.userId)
        .single();

      if (!user) {
        throw new ForbiddenException();
      }

      req.user = user;
      return next();
    }

    if (!refreshToken) {
      throw new ForbiddenException();
    }

    const { data: authToken } = await supabase
      .from('auth_tokens')
      .select('*')
      .eq('refreshToken', refreshToken)
      .single();

    if (!authToken) {
      throw new ForbiddenException();
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', authToken.userId)
      .single();

    if (!user) {
      throw new ForbiddenException();
    }

    const TOKEN_MAP = {
      accessToken: {
        name: this.ACCESS_TOKEN_NAME,
        token: uuidv4(),
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
      refreshToken: {
        name: this.REFRESH_TOKEN_NAME,
        token: uuidv4(),
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7 * 8),
      },
    } as const;

    Object.values(TOKEN_MAP).forEach(({ name, token, expires }) => {
      res.cookie(name, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        expires,
        path: '/',
      });
    });

    const newAuthToken = {
      accessToken: TOKEN_MAP.accessToken.token,
      accessTokenExpires: TOKEN_MAP.accessToken.expires.toUTCString(),
      refreshToken: TOKEN_MAP.refreshToken.token,
      refreshTokenExpires: TOKEN_MAP.refreshToken.expires.toUTCString(),
    } as const;

    await supabase
      .from('auth_tokens')
      .update(newAuthToken)
      .eq('userId', user.id);

    req.user = user;

    return next();
  }
}
