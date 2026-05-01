import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import BookingLog from "../models/BookingLog.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { randomUUID } from "crypto";

export const getBookings = catchAsync(async (req, res) => {
  const { page = 1, per_page = 10, status, field_id } = req.query;
  const user_id = req.user.role === "admin" ? req.query.user_id : req.user.id;

  const { rows, total } = await Booking.findAll({
    page,
    per_page,
    user_id,
    status,
    field_id,
  });

  return res.status(200).json({
    success: true,
    data: rows,
    meta: {
      total,
      per_page: Number(per_page),
      current_page: Number(page),
      last_page: Math.ceil(total / per_page),
    },
  });
});

export const getBookingById = catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) throw new AppError("Booking not found", 404);

  if (req.user.role !== "admin" && booking.user_id !== req.user.id) {
    throw new AppError("Forbidden", 403);
  }

  const payments = await Payment.findByBookingId(booking.id);
  const logs = await BookingLog.findByBookingId(booking.id);

  return res.status(200).json({
    success: true,
    data: { ...booking, payments, logs },
  });
});

export const createBooking = catchAsync(async (req, res) => {
  const { field_id, slot_id, date, start_time, end_time, total_price } =
    req.body;

  if (
    !field_id ||
    !slot_id ||
    !date ||
    !start_time ||
    !end_time ||
    !total_price
  ) {
    throw new AppError("All fields are required", 400);
  }

  const existing = await Booking.findBySlotId(slot_id);
  if (existing) throw new AppError("Slot already booked", 409);
  const booking_id = randomUUID();
  const lockRes = await fetch(
    `${process.env.FIELD_SERVICE_URL}/slots/${slot_id}/lock`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers["authorization"],
      },
      body: JSON.stringify({ booking_id: booking_id }),
    },
  );

  if (!lockRes.ok) throw new AppError("Failed to lock slot", 422);

  await Booking.create({
    user_id: req.user.id,
    field_id,
    slot_id,
    date,
    start_time,
    end_time,
    total_price,
  });

  const [rows] = await (
    await import("../config/db.js")
  ).default.query(
    "SELECT * FROM bookings WHERE slot_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1",
    [slot_id, req.user.id],
  );
  const booking = rows[0];

  await BookingLog.create({
    booking_id: booking.id,
    previous_status: null,
    new_status: "pending",
    note: "Booking created",
  });

  // update slot dengan booking_id yang benar
  await fetch(`${process.env.FIELD_SERVICE_URL}/slots/${slot_id}/lock`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: req.headers["authorization"],
    },
    body: JSON.stringify({ booking_id: booking.id }),
  });

  return res.status(201).json({
    success: true,
    message: "Booking created successfully",
    data: booking,
  });
});

// POST /bookings/:id/cancel
export const cancelBooking = catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) throw new AppError("Booking not found", 404);

  if (req.user.role !== "admin" && booking.user_id !== req.user.id) {
    throw new AppError("Forbidden", 403);
  }

  if (["fully_paid", "cancelled"].includes(booking.status)) {
    throw new AppError(`Cannot cancel a ${booking.status} booking`, 400);
  }

  const prevStatus = booking.status;
  await Booking.updateStatus(booking.id, "cancelled");

  // release slot di field-service
  await fetch(
    `${process.env.FIELD_SERVICE_URL}/slots/${booking.slot_id}/release`,
    {
      method: "PATCH",
      headers: { Authorization: req.headers["authorization"] },
    },
  );

  await BookingLog.create({
    booking_id: booking.id,
    previous_status: prevStatus,
    new_status: "cancelled",
    note: req.body.reason || "Cancelled by user",
  });

  return res.status(200).json({
    success: true,
    message: "Booking cancelled",
  });
});

// GET /bookings/dashboard (admin only)
export const getDashboard = catchAsync(async (req, res) => {
  if (req.user.role !== "admin") throw new AppError("Forbidden", 403);

  const db = (await import("../config/db.js")).default;

  const [[{ total_bookings }]] = await db.query(
    "SELECT COUNT(*) as total_bookings FROM bookings",
  );

  const [[{ total_revenue }]] = await db.query(
    "SELECT COALESCE(SUM(amount), 0) as total_revenue FROM payments WHERE status = 'paid'",
  );

  const [by_status] = await db.query(
    "SELECT status, COUNT(*) as count FROM bookings GROUP BY status",
  );

  const [recent] = await db.query(
    "SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5",
  );

  return res.status(200).json({
    success: true,
    data: {
      total_bookings,
      total_revenue,
      by_status,
      recent_bookings: recent,
    },
  });
});
