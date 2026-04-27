import pool from "../config/db.js";
const User = {
  findByEmail: async (email) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  },
  findById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  },
  findByOauthProviderId: async (oauth_provider, oauth_provider_id) => {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE oauth_provider = ? AND oauth_provider_id = ?",
      [oauth_provider, oauth_provider_id],
    );
    return rows[0];
  },
  create: async ({ name, email, password_hash, role = "user" }) => {
    const [result] = await pool.query(
      `INSERT INTO users (id,name,email,password_hash,role) VALUES (UUID(),?,?,?,?)`,
      [name, email, password_hash, role],
    );
    return result;
  },
  createOAuth: async ({
    name,
    email,
    oauth_provider,
    oauth_provider_id,
    profile_photo_url,
  }) => {
    const [result] = await pool.query(
      `INSERT INTO users (id,name,email,oauth_provider,oauth_provider_id,is_oauth_user,profile_photo_url,role) VALUES (UUID(), ?, ?, ?, ?, TRUE, ?, 'user')`,
      [name, email, oauth_provider, oauth_provider_id, profile_photo_url],
    );
    return result;
  },
  updateOauth: async (
    id,
    { oauth_provider, oauth_provider_id, profile_photo_url },
  ) => {
    await pool.query(
      `UPDATE users SET oauth_provider = ?, oauth_provider_id = ?, profile_photo_url=?,is_oauth_user=TRUE WHERE id = ?`,
      [oauth_provider, oauth_provider_id, profile_photo_url, id],
    );
  },
};

export default User;
