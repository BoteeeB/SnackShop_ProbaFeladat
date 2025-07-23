const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./snackshop.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      is_admin INTEGER DEFAULT 0
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price INTEGER,
      stock INTEGER
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total_price INTEGER,
      created_at TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      price INTEGER
    );
  `);

  const bcrypt = require("bcrypt");
  const password = bcrypt.hashSync("SnackBoss2025", 10);
  db.run(
    `INSERT OR IGNORE INTO users (username, password, is_admin) VALUES (?, ?, ?)`,
    ["admin", password, 1]
  );
});

module.exports = db;
