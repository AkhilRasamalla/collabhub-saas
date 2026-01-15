import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { config } from "../config/app.config";
import { registerSchema } from "../validation/auth.validation";
import { HTTPSTATUS } from "../config/http.config";
import { registerUserService } from "../services/auth.service";
import passport from "passport";

/* ================= GOOGLE LOGIN CALLBACK ================= */

export const googleLoginCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const currentWorkspace = req.user?.currentWorkspace;

    if (!currentWorkspace) {
      return res.redirect(
        `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
      );
    }

    return res.redirect(
      `${config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}`
    );
  }
);

/* ================= REGISTER (AUTO LOGIN FIX) ================= */

export const registerUserController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = registerSchema.parse(req.body);

    // create user
    const user = await registerUserService(body);

    // ✅ AUTO LOGIN AFTER SIGNUP
    req.login(user, (err) => {
      if (err) return next(err);

      return res.status(HTTPSTATUS.CREATED).json({
        message: "User created and logged in successfully",
        user,
      });
    });
  }
);

/* ================= LOGIN ================= */

export const loginController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: Express.User | false,
        info: { message: string } | undefined
      ) => {
        if (err) return next(err);

        if (!user) {
          return res.status(HTTPSTATUS.UNAUTHORIZED).json({
            message: info?.message || "Invalid email or password",
          });
        }

        req.logIn(user, (err) => {
          if (err) return next(err);

          return res.status(HTTPSTATUS.OK).json({
            message: "Logged in successfully",
            user,
          });
        });
      }
    )(req, res, next);
  }
);

/* ================= LOGOUT (FULL FIX) ================= */

export const logOutController = asyncHandler(
  async (req: Request, res: Response) => {
    req.logout(() => {
      if (req.session) {
        req.session.destroy(() => {
          res.clearCookie("collabhub.sid", {
            path: "/",
            httpOnly: true,
            secure: config.NODE_ENV === "production",
            sameSite: config.NODE_ENV === "production" ? "none" : "lax",
          });

          return res.status(HTTPSTATUS.OK).json({
            message: "Logged out successfully",
          });
        });
      } else {
        return res.status(HTTPSTATUS.OK).json({
          message: "Logged out successfully",
        });
      }
    });
  }
);
