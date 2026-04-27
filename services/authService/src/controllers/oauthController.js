import jwt from "jsonwebtoken";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../middlewares/AppError.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
export const googleRedirect = catchAsync(async (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  return res.redirect(googleAuthUrl);
});
