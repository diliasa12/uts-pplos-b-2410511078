import jwt from "jsonwebtoken";
import RefreshToken from "../models/RefreshToken.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../middlewares/AppError.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
export const googleRedirect = (req, res, next) => {
  const passport = req.app.get("passport");
  passport.authenticate("google", {
    scope: ["openid", "email", "profile"],
    access_type: "offline",
    prompt: "consent",
  })(req, res, next);
};

export const googleCallback = [
  (req, res, next) => {
    const passport = req.app.get("passport");
    passport.authenticate("google", {
      session: false,
      failWithError: true,
    })(req, res, next);
  },
  catchAsync(async (req, res) => {
    const user = req.user;
    if (!user) {
      throw new AppError("failed login with google", 401);
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 1000);
    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at,
      ip_address: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "Success login with google",
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile_photo_url: user.profile_photo_url,
          oauth_provider: user.oauth_provider,
        },
      },
    });
  }),
];
