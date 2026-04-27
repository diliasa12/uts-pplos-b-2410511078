import pool from "../config/db.js";
const TokenBlacklist = {
  add: async ({ user_id, access_token, expires_at }) => {
    await pool.query(
      `INSERT INTO token_blacklist (id,user_id,access_token,expires_at) VALUES (UUID(),?,?,?)`,
      [user_id, access_token, expires_at],
    );
  },
  isBlacklisted: async (access_token) => {
    const [rows] = await pool.query(
      "SELECT id FROM token_blacklist WHERE access_token = ?",
      [access_token],
    );
    return rows.length > 0;
  },
  deleteExpired: async () => {
    await pool.query("DELETE FROM token_blacklist WHERE expires_at < NOW()");
  },
};
export default TokenBlacklist;
