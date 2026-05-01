import pool from "../config/db.js";

const BookingLog = {
  create: async ({ booking_id, previous_status, new_status, note }) => {
    await pool.query(
      `INSERT INTO booking_logs (id, booking_id, previous_status, new_status, note)
       VALUES (UUID(), ?, ?, ?, ?)`,
      [booking_id, previous_status, new_status, note],
    );
  },

  findByBookingId: async (booking_id) => {
    const [rows] = await pool.query(
      "SELECT * FROM booking_logs WHERE booking_id = ? ORDER BY created_at ASC",
      [booking_id],
    );
    return rows;
  },
};

export default BookingLog;
