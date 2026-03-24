import { Strategy as GoogleStrategy, StrategyOptions } from 'passport-google-oauth20';
import { User } from '../../modules/user/user.model';
import { IsActive, Role } from '../../modules/user/user.interface';
import envVars from '../env';

const googleStrategyOptions: StrategyOptions = {
  clientID: envVars.GOOGLE_CLIENT_ID,
  clientSecret: envVars.GOOGLE_CLIENT_SECRET,
  callbackURL: envVars.GOOGLE_CALLBACK_URL,
};

export const googleStrategy = new GoogleStrategy(
  googleStrategyOptions,
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;

      if (!email) {
        return done(null, false, { message: 'No email found' });
      }

      let isUserExist = await User.findOne({ email });

      if (isUserExist) {
        if (!isUserExist.isVerified) {
          return done(null, false, { message: 'User is not verified' });
        }

        if (
          isUserExist.isActive === IsActive.BLOCKED ||
          isUserExist.isActive === IsActive.INACTIVE
        ) {
          return done(null, false, { message: `User is ${isUserExist.isActive}` });
        }

        if (isUserExist.isDeleted) {
          return done(null, false, { message: 'User is deleted' });
        }
      } else {
        isUserExist = await User.create({
          email,
          name: profile.displayName,
          picture: profile.photos?.[0].value,
          role: Role.USER,
          isVerified: true,
          auths: [
            {
              provider: 'google',
              providerId: profile.id,
            },
          ],
        });
      }

      return done(null, isUserExist);
    } catch (error) {
      console.error('Google Strategy Error:', error);
      return done(error);
    }
  },
);
