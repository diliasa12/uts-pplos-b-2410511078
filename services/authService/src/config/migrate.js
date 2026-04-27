import pool from "./db.js";
import mysql from "mysql2/promise";
import "dotenv/config";
async function migrate() {
  const tempConnection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });
  await tempConnection.query(`
  CREATE DATABASE IF NOT EXISTS \`${process.env.DB_DATABASE}\``);
  await tempConnection.end();
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users(
      id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password_hash VARCHAR(255),
      oauth_provider VARCHAR(20),
      oauth_provider_id VARCHAR(150),
      is_oauth_user BOOLEAN DEFAULT FALSE,
      profile_photo_url TEXT,
      role ENUM('user','admin') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
      `);

    await conn.query(`
       CREATE TABLE IF NOT EXISTS refresh_tokens(
       id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
       user_id CHAR(36) NOT NULL,
       token TEXT NOT NULL,
       expires_at TIMESTAMP NOT NULL,
       is_revoked BOOLEAN DEFAULT FALSE,
       ip_address VARCHAR(45),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
       ) 
        `);

    await conn.query(`
        CREATE TABLE IF NOT EXISTS token_blacklist(
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id CHAR(36) NOT NULL,
        access_token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        `);

    console.log("Migration success");
  } catch (error) {
    console.log("migration gagal:", error);
  } finally {
    conn.release();
    process.exit();
  }
}
migrate();
