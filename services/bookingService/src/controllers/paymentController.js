import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import BookingLog from "../models/BookingLog.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

// POST /bookings/:id/payments
export const createPayment = catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) throw new AppError("Booking not found", 404);

  if (req.user.role !== "admin" && booking.user_id !== req.user.id) {
    throw new AppError("Forbidden", 403);
  }

  if (booking.status === "cancelled") {
    throw new AppError("Cannot pay a cancelled booking", 400);
  }

  if (booking.status === "fully_paid") {
    throw new AppError("Booking already fully paid", 400);
  }

  const { type, amount, payment_method, proof_url } = req.body;

  if (!type || !amount || !payment_method) {
    throw new AppError("type, amount, and payment_method are required", 400);
  }

  if (!["dp", "full"].includes(type)) {
    throw new AppError("Payment type must be dp or full", 400);
  }

  if (type === "dp" && booking.status === "dp_paid") {
    throw new AppError("DP already paid", 409);
  }

  await Payment.create({
    booking_id: booking.id,
    type,
    amount,
    payment_method,
    proof_url,
  });

  const [payments] = await (
    await import("../config/db.js")
  ).default.query(
    "SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1",
    [booking.id],
  );
  const payment = payments[0];

  await Payment.updateStatus(payment.id, "paid");

  const prevStatus = booking.status;
  const newStatus =
    type === "full" || (type === "dp" && booking.status === "dp_paid")
      ? "fully_paid"
      : "dp_paid";

  await Booking.updateStatus(booking.id, newStatus);

  await BookingLog.create({
    booking_id: booking.id,
    previous_status: prevStatus,
    new_status: newStatus,
    note: `Payment ${type} confirmed via ${payment_method}`,
  });

  return res.status(201).json({
    success: true,
    message: "Payment recorded successfully",
    data: { ...payment, status: "paid" },
  });
});

// GET /bookings/:id/payments
export const getPayments = catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) throw new AppError("Booking not found", 404);

  if (req.user.role !== "admin" && booking.user_id !== req.user.id) {
    throw new AppError("Forbidden", 403);
  }

  const payments = await Payment.findByBookingId(booking.id);

  return res.status(200).json({
    success: true,
    data: payments,
  });
});
