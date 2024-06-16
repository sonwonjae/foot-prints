// src/auth/auth.controller.ts
import { Controller, Get, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response as ExpressResponse } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('callback/github')
  handleGithubCallback(
    @Query('code') code: string,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    return this.authService.handleGithubCallback(code, res);
  }
}
