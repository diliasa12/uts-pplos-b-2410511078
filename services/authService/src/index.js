import e from "express";
import dotenv from "dotenv";
import errorHandler from "./middlewares/erroHandler.js";
import session from "express-session";
import passport from "./config/passport.js";
dotenv.config({
  path: "./.env",
});
const app = e();
const PORT = process.env.PORT;
app.use(e.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.set("passport", passport);
app.use(errorHandler);
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
