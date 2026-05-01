import pool from "../config/db.js";

const Payment = {
  findByBookingId: async (booking_id) => {
    const [rows] = await pool.query(
      "SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC",
      [booking_id],
    );
    return rows;
  },

  create: async ({ booking_id, type, amount, payment_method, proof_url }) => {
    const [result] = await pool.query(
      `INSERT INTO payments (id, booking_id, type, amount, payment_method, proof_url)
       VALUES (UUID(), ?, ?, ?, ?, ?)`,
      [booking_id, type, amount, payment_method, proof_url],
    );
    return result;
  },

  updateStatus: async (id, status) => {
    const paid_at = status === "paid" ? new Date() : null;
    await pool.query(
      "UPDATE payments SET status = ?, paid_at = ? WHERE id = ?",
      [status, paid_at, id],
    );
  },

  findById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM payments WHERE id = ?", [
      id,
    ]);
    return rows[0];
  },
};

export default Payment;
