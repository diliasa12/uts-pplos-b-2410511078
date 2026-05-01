import mysql from "mysql2/promise";
import "dotenv/config";
import pool from "./db.js";
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
      CREATE TABLE IF NOT EXISTS bookings (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id CHAR(36) NOT NULL,
        field_id CHAR(36) NOT NULL,
        slot_id CHAR(36) NOT NULL,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        status ENUM('pending','dp_paid','fully_paid','cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        booking_id CHAR(36) NOT NULL,
        type ENUM('dp','full') NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending','paid','failed') DEFAULT 'pending',
        payment_method VARCHAR(50),
        proof_url VARCHAR(500),
        paid_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS booking_logs (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        booking_id CHAR(36) NOT NULL,
        previous_status ENUM('pending','dp_paid','fully_paid','cancelled'),
        new_status ENUM('pending','dp_paid','fully_paid','cancelled') NOT NULL,
        note VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
      )
    `);

    console.log("Migration success");
  } catch (err) {
    console.log("Migration failed:", err);
  } finally {
    await conn.release();
    process.exit();
  }
}

migrate();
