import pool from "../config/db.js";

const Booking = {
  findAll: async ({ page = 1, per_page = 10, user_id, status, field_id }) => {
    const offset = (page - 1) * per_page;
    let where = "WHERE 1=1";
    const params = [];

    if (user_id) {
      where += " AND user_id = ?";
      params.push(user_id);
    }
    if (status) {
      where += " AND status = ?";
      params.push(status);
    }
    if (field_id) {
      where += " AND field_id = ?";
      params.push(field_id);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM bookings ${where}`,
      params,
    );

    const [rows] = await pool.query(
      `SELECT * FROM bookings ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(per_page), Number(offset)],
    );

    return { rows, total };
  },

  findById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM bookings WHERE id = ?", [
      id,
    ]);
    return rows[0];
  },

  create: async ({
    user_id,
    field_id,
    slot_id,
    date,
    start_time,
    end_time,
    total_price,
  }) => {
    const [result] = await pool.query(
      `INSERT INTO bookings (id, user_id, field_id, slot_id, date, start_time, end_time, total_price)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, field_id, slot_id, date, start_time, end_time, total_price],
    );
    return result;
  },

  updateStatus: async (id, status) => {
    await pool.query("UPDATE bookings SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
  },

  findBySlotId: async (slot_id) => {
    const [rows] = await pool.query(
      "SELECT * FROM bookings WHERE slot_id = ? AND status != 'cancelled'",
      [slot_id],
    );
    return rows[0];
  },
};

export default Booking;
