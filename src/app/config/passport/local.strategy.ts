import {
  Strategy as LocalStrategy,
  IStrategyOptionsWithRequest,
} from 'passport-local';
import bcrypt from 'bcryptjs';
import { User } from '../../modules/user/user.model';
import { IsActive } from '../../modules/user/user.interface';
import sendOTP from '../../modules/otp/otp.utils';
import envVars from '../env';

const localStrategyOptions: IStrategyOptionsWithRequest = {
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
};

export const localStrategy = new LocalStrategy(
  localStrategyOptions,
  async (req, email, password, done) => {
    try {
      const isUserExist = await User.findOne({ email });

      if (!isUserExist) {
        return done(null, false, { message: "User doesn't exist" });
      }

      if (
        isUserExist.isActive === IsActive.BLOCKED ||
        isUserExist.isActive === IsActive.INACTIVE
      ) {
        return done(null, false, {
          message: `User is ${isUserExist.isActive}`,
        });
      }

      if (isUserExist.isDeleted) {
        return done(null, false, { message: 'User is deleted' });
      }

      if (!isUserExist.isVerified) {
        await sendOTP(email);
        return done(null, false, { message: "User isn't verified" });
      }

      const isGoogleAuthenticate: boolean = isUserExist.auths.some(
        (providerObj) => providerObj.provider === 'google',
      );

      if (isGoogleAuthenticate && !isUserExist.password) {
        return done(null, false, {
          message:
            'You have authenticated through Google. Please login with Google and set a password in your profile to use credentials.',
        });
      }

      const isPasswordMatched = await bcrypt.compare(
        password,
        isUserExist.password as string,
      );

      if (!isPasswordMatched) {
        return done(null, false, { message: 'Incorrect password' });
      }

      return done(null, isUserExist);
    } catch (error) {
      if (envVars.NODE_ENV === 'development') {
        console.error('Local Strategy Error:', error);
      }
      return done(error);
    }
  },
);
