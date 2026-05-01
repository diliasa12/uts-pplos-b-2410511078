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
import authMiddleware from "../middlewares/authMiddleware.js";
import jwtValidate from "../middlewares/jwtValidate.js";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, me);

router.get("/oauth/google", googleRedirect);
router.get("/oauth/google/callback", googleCallback);

router.post("/validate-token", jwtValidate, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Token is valid",
  });
});
export default router;
