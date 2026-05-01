import jwt from "jsonwebtoken";
import "dotenv/config";

const publicPaths = [
  { method: "POST", path: "/service1/auth/register" },
  { method: "POST", path: "/service1/auth/login" },
  { method: "POST", path: "/service1/auth/refresh" },
  { method: "GET", path: "/service1/auth/oauth/google" },
  { method: "GET", path: "/service1/auth/oauth/google/callback" },
  { method: "GET", path: "/service2/fields" },
  { method: "GET", path: "/service2/categories" },
  { method: "POST", path: "/service1/auth/validate-token" },
];

const isPublicPath = (req) => {
  return publicPaths.some((p) => {
    if (p.method !== req.method) return false;
    return req.path === p.path || req.path.startsWith(p.path + "/");
  });
};

const authMiddleware = async (req, res, next) => {
  if (isPublicPath(req)) return next();

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token not found",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const validateRes = await fetch(
      "http://localhost:3001/auth/validate-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-gateway-secret": process.env.GATEWAY_SECRET,
        },
      },
    );

    if (!validateRes.ok) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked",
      });
    }

    req.headers["x-user-id"] = decoded.id;
    req.headers["x-user-role"] = decoded.role;
    req.headers["x-user-email"] = decoded.email;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default authMiddleware;
