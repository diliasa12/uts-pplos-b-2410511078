import jwt from "jsonwebtoken";
import TokenBlacklist from "../models/TokenBlacklist.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

const jwtValidate = catchAsync(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) throw new AppError("Access token not found", 401);

  const decoded = jwt.verify(token, process.env.SECRET_KEY);

  const isBlacklisted = await TokenBlacklist.isBlacklisted(token);
  if (isBlacklisted) throw new AppError("Token has been revoked", 401);

  req.user = decoded;
  next();
});

export default jwtValidate;
