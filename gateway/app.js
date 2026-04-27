import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
const app = express();
const PORT = 3000;
app.get("/", (req, res) => {
  res.send("hello world");
});
app.use(
  "/service1",
  createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
    pathRewrite: {
      "^/service1": "",
    },
  }),
);
app.use(
  "/service2",
  createProxyMiddleware({
    target: "http://localhost:3002",
    changeOrigin: true,
    pathRewrite: {
      "^/service2": "",
    },
  }),
);
app.use(
  "/service3",
  createProxyMiddleware({
    target: "http://localhost:3003",
    changeOrigin: true,
    pathRewrite: {
      "^/service3": "",
    },
  }),
);
app.listen(PORT, () =>
  console.log(`Gateway running on http://localhost:${PORT}`),
);
