import pool from "../config/db.js";
const RefreshToken = {
  create: async ({ user_id, token, expires_at, ip_address }) => {
    const [result] = await pool.query(
      `INSERT INTO refresh_tokens (id,user_id,token,expires_at,ip_address) VALUES (UUID(),?,?,?,?)`,
      [user_id, token, expires_at, ip_address],
    );
    return result;
  },
  findByToken: async (token) => {
    const [rows] = await pool.query(
      `SELECT * FROM refrsh_tokens WHERE token = ? AND is_revoked =FALSE AND expires_at > NOW()`,
      [token],
    );
    return rows[0];
  },
  revoke: async (token) => {
    await pool.query(
      "UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = ?",
      [token],
    );
  },
  revokeAllByUserId: async (user_id) => {
    await pool.query(
      "UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = ?",
      [user_id],
    );
  },
  deleteExpired: async () => {
    await pool.query("DELTE FROM refresh_tokens WHERE expires_at < NOW()");
  },
};
export default RefreshToken;
