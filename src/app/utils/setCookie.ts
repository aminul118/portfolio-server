import { Response } from 'express';
import envVars from '../config/env';

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
  const { COOKIE_SECURE, COOKIE_SAMESITE, COOKIE_DOMAIN } = envVars;

  if (tokenInfo.accessToken) {
    res.cookie('accessToken', tokenInfo.accessToken, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: COOKIE_SAMESITE,
      domain: COOKIE_DOMAIN,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });
  }

  if (tokenInfo.refreshToken) {
    res.cookie('refreshToken', tokenInfo.refreshToken, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: COOKIE_SAMESITE,
      domain: COOKIE_DOMAIN,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    });
  }
};
