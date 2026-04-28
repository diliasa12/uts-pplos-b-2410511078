import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  me,
} from "../controllers/authController.js";
import {
  googleCallback,
  googleRedirect,
} from "../controllers/oauthController.js";
import authMiddleware from "../middlewares/jwtmiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, me);

router.get("/oauth/google", googleRedirect);
router.get("/oauth/google/callback", googleCallback);

export default router;
