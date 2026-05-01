import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later",
    });
  },
});

app.use(limiter);
app.use(express.json());


const publicPaths = [
  { method: "POST", path: "/service1/auth/register" },
  { method: "POST", path: "/service1/auth/login" },
  { method: "POST", path: "/service1/auth/refresh" },
  { method: "GET", path: "/service1/auth/oauth/google" },
  { method: "GET", path: "/service1/auth/oauth/google/callback" },
  { method: "GET", path: "/service2/fields" },
  { method: "GET", path: "/service2/categories" },
];

const isPublicPath = (req) => {
  return publicPaths.some((p) => {
    if (p.method !== req.method) return false;
    return req.path === p.path || req.path.startsWith(p.path + "/");
  });
};

const jwtVerify = (req, res, next) => {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

app.use(jwtVerify);

app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.path}`);
  next();
});

app.use(
  "/service1",
  createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
    pathRewrite: { "^/service1": "" },
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(`[Gateway] → auth-service ${proxyReq.path}`);
      },
      error: (err, req, res) => {
        res.status(503).json({
          success: false,
          message: "Auth service unavailable",
        });
      },
    },
  }),
);

app.use(
  "/service2",
  createProxyMiddleware({
    target: "http://localhost:3002/api",
    changeOrigin: true,
    pathRewrite: { "^/service2": "" },
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(`[Gateway] → field-service ${proxyReq.path}`);
      },
      error: (err, req, res) => {
        res.status(503).json({
          success: false,
          message: "Field service unavailable",
        });
      },
    },
  }),
);

app.use(
  "/service3",
  createProxyMiddleware({
    target: "http://localhost:3003",
    changeOrigin: true,
    pathRewrite: { "^/service3": "" },
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(`[Gateway] → booking-service ${proxyReq.path}`);
      },
      error: (err, req, res) => {
        res.status(503).json({
          success: false,
          message: "Booking service unavailable",
        });
      },
    },
  }),
);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(`[Gateway Error]`, err.message);

  if (err.code === "ECONNREFUSED") {
    return res.status(503).json({
      success: false,
      message: "Service unavailable",
    });
  }

  res.status(500).json({
    success: false,
    message: "Gateway error",
  });
});

app.listen(PORT, () => {
  console.log(`Gateway running on http://localhost:${PORT}`);
});
