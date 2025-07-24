const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./snackshop.db");

db.exec("PRAGMA foreign_keys = ON;");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   TEXT    UNIQUE,
      password   TEXT,
      is_admin   INTEGER DEFAULT 0
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      name     TEXT,
      price    INTEGER,
      stock    INTEGER
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER,
      total_price  INTEGER,
      created_at   TEXT
    );
  `);

  db.run(`DROP TABLE IF EXISTS order_items;`);

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id      INTEGER NOT NULL,
      product_id    INTEGER,
      product_name  TEXT    NOT NULL,   -- snapshot of the name at order time
      quantity      INTEGER NOT NULL,
      price         INTEGER NOT NULL,   -- snapshot of the price at order time
      FOREIGN KEY(order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,
      FOREIGN KEY(product_id)
        REFERENCES products(id)
        ON DELETE SET NULL
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
