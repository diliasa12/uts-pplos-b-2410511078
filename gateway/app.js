import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import "dotenv/config";
import authMiddleware from "./middlewares/authMiddleware.js";
import limiter from "./utils/rateLimiter.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(limiter);

app.use(authMiddleware);

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
        proxyReq.setHeader("x-gateway-secret", process.env.GATEWAY_SECRET);
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
        proxyReq.setHeader("x-gateway-secret", process.env.GATEWAY_SECRET);
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
        proxyReq.setHeader("x-gateway-secret", process.env.GATEWAY_SECRET);
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
