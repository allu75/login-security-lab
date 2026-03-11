import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcrypt";

const db = new DatabaseSync("./app.db");

export const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    try {
      const result = db.prepare(sql).run(...params);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });

export const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    try {
      const row = db.prepare(sql).get(...params);
      resolve(row);
    } catch (err) {
      reject(err);
    }
  });

export const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    try {
      const rows = db.prepare(sql).all(...params);
      resolve(rows);
    } catch (err) {
      reject(err);
    }
  });

export const init = async () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    );
  `);

  const existing = await get(`SELECT id FROM users WHERE email='test@test.dev'`);
  if (!existing) {
    const hashedPassword = await bcrypt.hash("test1234", 10);

    await run(
      `INSERT INTO users (email, password, role)
   VALUES (?, ?, ?)`,
      ["test@test.dev", hashedPassword, "admin"]
    );
  }
};
