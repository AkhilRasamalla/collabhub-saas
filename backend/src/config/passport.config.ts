import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { Request } from "express";

import { config } from "./app.config";
import { loginOrCreateAccountService } from "../services/auth.service";
import { ProviderEnum } from "../enums/account-provider.enum";
import { NotFoundException, BadRequestException } from "../utils/appError";
import UserModel from "../models/user.model";

/**
 * GOOGLE STRATEGY — ENABLE ONLY IF CREDS EXIST
 */
if (
  config.GOOGLE_CLIENT_ID &&
  config.GOOGLE_CLIENT_SECRET &&
  config.GOOGLE_CALLBACK_URL
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.GOOGLE_CALLBACK_URL,
        scope: ["profile", "email"],
        passReqToCallback: true,
      },
      async (req: Request, accessToken, refreshToken, profile, done) => {
        try {
          const { email, sub: googleId, picture } = profile._json as any;

          if (!googleId || !email) {
            throw new NotFoundException("Google profile incomplete");
          }

          const { user } = await loginOrCreateAccountService({
            provider: ProviderEnum.GOOGLE,
            displayName: profile.displayName,
            providerId: googleId,
            picture,
            email,
          });

          done(null, user);
        } catch (error) {
          done(error as any, false);
        }
      }
    )
  );
} else {
  console.warn("⚠️ Google OAuth disabled: credentials missing");
}

/**
 * LOCAL STRATEGY — EMAIL + PASSWORD
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: true,
    },
    async (email, password, done) => {
      try {
        const user = await UserModel.findOne({ email }).select("+password");

        if (!user) {
          throw new BadRequestException("Invalid email or password");
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
          throw new BadRequestException("Invalid email or password");
        }

        user.password = undefined as any;
        done(null, user);
      } catch (error) {
        done(error as any, false);
      }
    }
  )
);

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

export default passport;
