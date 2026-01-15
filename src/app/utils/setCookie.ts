import { Response } from 'express';
import envVars from '../config/env';

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const sameSite = isProduction ? 'none' : 'lax'; // allow cross-subdomain in prod
  const domain = isProduction ? '.aminuldev.site' : undefined;

  if (tokenInfo.accessToken) {
    res.cookie('accessToken', tokenInfo.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite,
      domain,
      path: '/',
      maxAge: Number(envVars.JWT.JWT_ACCESS_EXPIRES),
    });
  }

  if (tokenInfo.refreshToken) {
    res.cookie('refreshToken', tokenInfo.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite,
      domain,
      path: '/',
      maxAge: Number(envVars.JWT.JWT_REFRESH_EXPIRES),
    });
  }
};
