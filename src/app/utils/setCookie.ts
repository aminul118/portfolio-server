import { Response } from 'express';
import envVars from '../config/env';

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
  const isProduction = envVars.NODE_ENV === 'production';

  const cookieConfigBase = {
    httpOnly: true,
    secure: isProduction, // MUST be true when sameSite='none'
    sameSite: isProduction ? 'none' : 'lax',
    domain: isProduction ? '.aminuldev.site' : undefined,
    path: '/',
  } as const;

  if (tokenInfo.accessToken) {
    res.cookie('accessToken', tokenInfo.accessToken, {
      ...cookieConfigBase,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });
  }

  if (tokenInfo.refreshToken) {
    res.cookie('refreshToken', tokenInfo.refreshToken, {
      ...cookieConfigBase,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
  }
};
