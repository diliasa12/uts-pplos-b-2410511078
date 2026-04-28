import jwt from "jsonwebtoken";
import TokenBlacklist from "../models/TokenBlacklist.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "./AppError.js";

const authMiddleware = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    throw new AppError("Access token not found", 401);
  }

  const isBlacklisted = await TokenBlacklist.isBlacklisted(token);
  if (isBlacklisted) {
    throw new AppError("Invalid Token, please re-login", 401);
  }

  const decode = jwt.verify(token, process.env.SECRET_KEY);
  req.user = decode;
  next();
});
export default authMiddleware;
