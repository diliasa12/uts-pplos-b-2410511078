import e from "express";
import dotenv from "dotenv";
import errorHandler from "./middlewares/erroHandler.js";
import session from "express-session";
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoute.js";
dotenv.config({
  path: "./.env",
});
const app = e();
const PORT = process.env.PORT;
app.use(e.json());
app.use(e.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.set("passport", passport);

app.use("/auth", authRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "auth-service",
    status: "running",
    port: process.env.PORT,
  });
});
app.use(errorHandler);
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
