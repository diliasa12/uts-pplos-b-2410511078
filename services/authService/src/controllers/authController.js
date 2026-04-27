import bcrypt from "bcryptjs";
import jwt, { decode } from "jsonwebtoken";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import TokenBlacklist from "../models/TokenBlacklist.js";
import AppError from "../middlewares/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import {
  generateRefreshToken,
  generateAccessToken,
} from "../utils/generateToken.js";

export const register = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    throw new AppError("name,email, and password required", 400);
  }
  const userExist = await User.findByEmail(email);
  if (userExist) {
    throw new AppError("Email has been registered", 409);
  }
  const password_hash = await bcrypt.hash(password, 10);
  await User.create({ name, email, password_hash });
  return res
    .status(201)
    .json({ success: true, message: "Registration success" });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError("Email and Password required", 400);
  }
  const user = await User.findByEmail(email);
  if (!user) {
    throw new AppError("Wrong Email", 401);
  }
  const isPassMatch = await bcrypt.compare(password, user.password_hash);
  if (!isPassMatch) {
    throw new AppError("Wrong Password", 401);
  }
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const ip_address = req.ip;
  await RefreshToken.create({
    user_id: user.id,
    token: refreshToken,
    expires_at,
    ip_address,
  });
  return res.status(200).json({
    success: true,
    message: "Login successfull",
    data: {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        profile_photo_url: user.profile_photo_url,
      },
    },
  });
});

export const refresh = catchAsync(async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    throw new AppError("Refresh Token is required", 400);
  }
  const storedToken = await RefreshToken.findByToken(refresh_token);
  if (!storedToken) {
    throw new AppError("Invalid Refresh Token or expired", 401);
  }
  const decode = jwt.verify(refresh_token, process.env.REFRESH_SECRET_KEY);
  const user = await User.findById(decode.id);
  if (!user) {
    throw new AppError("User not found", 401);
  }
  await RefreshToken.revoke(refresh_token);
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({
    user_id: user.id,
    token: newRefreshToken,
    expires_at,
    ip_address: req.ip,
  });
  return res.status(200).json({
    success: true,
    message: "Token successfully updated",
    data: {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    },
  });
});

export const logout = catchAsync(async (req, res) => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader && authHeader.split(" ")[1];
  const { refresh_token } = req.body;

  if (!accessToken) {
    throw new AppError("Access token is required", 400);
  }
  const decoded = jwt.decode(accessToken);
  if (!decoded) {
    throw new AppError("Invalid Token", 401);
  }
  const expires_at = new Date(deocode.exp * 1000);
  await TokenBlacklist.add({
    user_id: decoded.id,
    access_token: accessToken,
    expires_at,
  });
  if (refresh_token) {
    await RefreshToken.revoke(refresh_token);
  }
  return res.status(200).json({ success: true, message: "Login Success" });
});

export const me = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return res.status(200).json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      role: user.role,
      is_oauth_user: user.is_oauth_user,
      oauth_provider: user.oauth_provider,
      profile_photo_url: user.profile_photo_url,
    },
  });
});
