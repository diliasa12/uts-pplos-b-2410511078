import { Router } from "express";
import {
  getBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  getDashboard,
} from "../controllers/bookingController.js";
import {
  createPayment,
  getPayments,
} from "../controllers/paymentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/dashboard", getDashboard);
router.get("/", getBookings);
router.post("/", createBooking);
router.get("/:id", getBookingById);
router.post("/:id/cancel", cancelBooking);
router.post("/:id/payments", createPayment);
router.get("/:id/payments", getPayments);

export default router;
