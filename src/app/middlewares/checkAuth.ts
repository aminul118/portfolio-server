/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { IUser } from '../modules/user/user.interface';
import passport from 'passport';
import httpStatus from 'http-status-codes';
import AppError from '../errorHelpers/AppError';

/**
 * Middleware to check if the user is authenticated and has the required roles.
 * Uses passport-jwt strategy for authentication.
 */
const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      'jwt',
      { session: false },
      async (
        err: Error | null,
        user: IUser | null,
        info: { message?: string } | undefined,
      ) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          const errorMessage = info?.message || 'You are not authorized';
          return next(new AppError(httpStatus.UNAUTHORIZED, errorMessage));
        }

        // Check for roles
        if (authRoles.length && !authRoles.includes(user.role)) {
          return next(
            new AppError(httpStatus.FORBIDDEN, 'You are not permitted'),
          );
        }

        // Attach user to request
        (req as any).user = user;
        next();
      },
    )(req, res, next);
  };

export default checkAuth;
