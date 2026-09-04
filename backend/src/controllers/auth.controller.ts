import { Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../config/database';
import { env } from '../config/env';
import { AuthenticatedUser } from '../types';


// Configure Passport Google Strategy
passport.use(new GoogleStrategy({
    clientID: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackURL: env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email found in Google profile'));
      }

      const user = await prisma.user.upsert({
        where: { googleId: profile.id },
        update: {
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value,
        },
        create: {
          googleId: profile.id,
          email: email,
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value,
        }
      });

      done(null, user);
    } catch (error) {
      done(error as Error);
    }
  }
));

export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

export const googleCallback = (req: Request, res: Response) => {
  passport.authenticate('google', { session: false }, (err: any, user: AuthenticatedUser | false) => {
    if (err || !user) {
      return res.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);
    }

    // Sign JWT — expiresIn must be a number (seconds) or ms-compatible string
    const signOptions: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    };
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
      env.JWT_SECRET,
      signOptions
    );

    // Set httpOnly cookie so JS cannot read the token (XSS protection)
    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.redirect(`${env.FRONTEND_URL}/dashboard`);
  })(req, res);
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};

export const me = (req: Request, res: Response) => {
  res.json({ user: req.user });
};
