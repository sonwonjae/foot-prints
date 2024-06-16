// src/auth/auth.service.ts
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from 'octokit';
import { lastValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import type { Response as ExpressResponse } from 'express';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class AuthService {
  private GITHUB_OAUTH_APP_CLIENT_ID: string;
  private GITHUB_OAUTH_APP_CLIENT_SECRET: string;
  private ACCESS_TOKEN_NAME: string;
  private REFRESH_TOKEN_NAME: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {
    this.GITHUB_OAUTH_APP_CLIENT_ID = this.configService.get<string>(
      'GITHUB_OAUTH_APP_CLIENT_ID',
    );
    this.GITHUB_OAUTH_APP_CLIENT_SECRET = this.configService.get<string>(
      'GITHUB_OAUTH_APP_CLIENT_SECRET',
    );

    this.ACCESS_TOKEN_NAME =
      this.configService.get<string>('ACCESS_TOKEN_NAME');
    this.REFRESH_TOKEN_NAME =
      this.configService.get<string>('REFRESH_TOKEN_NAME');
  }

  async handleGithubCallback(code: string, res: ExpressResponse) {
    const { data: tokenData } = await lastValueFrom<{
      data: { access_token: string };
    }>(
      this.httpService.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: this.GITHUB_OAUTH_APP_CLIENT_ID,
          client_secret: this.GITHUB_OAUTH_APP_CLIENT_SECRET,
          code,
        },
        {
          headers: {
            accept: 'application/json',
          },
        },
      ),
    );

    const { access_token: accessToken } = tokenData;

    const octokit = new Octokit({
      auth: accessToken,
    });

    const { data: gitHubUserData } = await octokit.request('GET /user', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

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

    const tokenInfo = {
      accessToken: TOKEN_MAP.accessToken.token,
      accessTokenExpires: TOKEN_MAP.accessToken.expires.toUTCString(),
      refreshToken: TOKEN_MAP.refreshToken.token,
      refreshTokenExpires: TOKEN_MAP.refreshToken.expires.toUTCString(),
    } as const;

    const userInfo = {
      avatarUrl: gitHubUserData.avatar_url ?? '',
      name: gitHubUserData.name ?? '',
      email: gitHubUserData.email ?? '',
      provider: 'github',
      providerId: gitHubUserData.node_id,
    } as const;

    const supabase = this.supabaseService.getClient();

    /** NOTE: gitHub node_id기반으로 저장해둔 유저 정보 GET */
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('providerId', gitHubUserData.node_id)
      .single();

    const isUser = !!user.id;

    /** NOTE: gitHub node_id기반으로 저장해둔 유저 정보 GET */
    if (isUser) {
      const { data: updatedUser } = await supabase
        .from('users')
        .update(userInfo)
        .eq('providerId', gitHubUserData.node_id)
        .select('*')
        .single();

      await supabase
        .from('auth_tokens')
        .update(tokenInfo)
        .eq('userId', updatedUser.id);
    } else {
      const { data: newUser } = await supabase
        .from('users')
        .insert(userInfo)
        .select('*')
        .single();

      await supabase.from('auth_tokens').insert({
        userId: newUser.id,
        ...tokenInfo,
      });
    }

    return res.redirect('http://localhost:5000');
  }
}
