import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { Request } from "express";

import { config } from "./app.config";
import { loginOrCreateAccountService } from "../services/auth.service";
import { verifyUserService } from "../services/user.service";
import { ProviderEnum } from "../enums/account-provider.enum";
import { NotFoundException } from "../utils/appError";

/**
 * GOOGLE STRATEGY — only if creds exist
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

          if (!googleId) {
            throw new NotFoundException("Google ID missing");
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
 * LOCAL STRATEGY — always enabled
 */
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password", session: true },
    async (email, password, done) => {
      try {
        const user = await verifyUserService({ email, password });
        done(null, user);
      } catch (error: any) {
        done(error, false);
      }
    }
  )
);

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

export default passport;
