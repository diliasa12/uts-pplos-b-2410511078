import e from "express";
import dotenv from "dotenv";
import errorHandler from "./middlewares/erroHandler.js";
import session from "express-session";
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoute.js";
import gatewayOnly from "./middlewares/gatewayOnly.js";
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
app.use(gatewayOnly);
app.use("/auth", authRoutes);

app.use(errorHandler);
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
