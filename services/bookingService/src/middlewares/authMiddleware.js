import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

const authMiddleware = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) throw new AppError("Access token not found", 401);

  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  req.user = decoded;

  next();
});

export default authMiddleware;
