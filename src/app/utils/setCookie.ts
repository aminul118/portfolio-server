import { Response } from 'express';

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const sameSite = isProduction ? 'none' : 'lax'; // allow cross-subdomain in prod
  const domain = isProduction ? '.shrlbd.com' : undefined;

  if (tokenInfo.accessToken) {
    res.cookie('accessToken', tokenInfo.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite,
      domain,
      path: '/', // always include
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });
  }

  if (tokenInfo.refreshToken) {
    res.cookie('refreshToken', tokenInfo.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite,
      domain,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
  }
};
