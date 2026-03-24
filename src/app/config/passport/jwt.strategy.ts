import { Request } from 'express';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { User } from '../../modules/user/user.model';
import { IsActive } from '../../modules/user/user.interface';
import envVars from '../env';

const cookieExtractor = (req: Request) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['accessToken'];
  }
  return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};

const jwtStrategyOptions: StrategyOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: envVars.JWT_ACCESS_SECRET,
};

export const jwtStrategy = new JwtStrategy(jwtStrategyOptions, async (jwtPayload, done) => {
  try {
    const user = await User.findOne({ email: jwtPayload.email });

    if (!user) {
      return done(null, false, { message: 'User does not exist' });
    }

    if (user.isActive === IsActive.BLOCKED || user.isActive === IsActive.INACTIVE) {
      return done(null, false, { message: `User is ${user.isActive}` });
    }

    if (user.isDeleted) {
      return done(null, false, { message: 'User is deleted' });
    }

    if (!user.isVerified) {
      return done(null, false, { message: "User isn't verified" });
    }

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
});
