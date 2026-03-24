/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from 'passport';
import { User } from '../modules/user/user.model';
import { localStrategy } from './passport/local.strategy';
import { googleStrategy } from './passport/google.strategy';
import { jwtStrategy } from './passport/jwt.strategy';

// Using modular strategies
passport.use(localStrategy);
passport.use(googleStrategy);
passport.use(jwtStrategy);

// ----------------------------
// Session Handling (If needed for Google OAuth state, but we mainly use JWT)
// ----------------------------

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});

passport.deserializeUser(
  async (id: string, done: (err: any, user?: any) => void) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      console.error('Deserialize Error:', error);
      done(error);
    }
  },
);

export default passport;

