const util = require("util");
const db = require("../db");

const dbGet = util.promisify(db.get.bind(db));
const dbRun = util.promisify(db.run.bind(db));

function runWithLastID(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID });
    });
  });
}

async function orderRoutes(fastify, options) {
  fastify.post("/api/order", async (request, reply) => {
    const session = request.cookies.session;
    if (!session) return reply.code(403).send({ error: "Bejelentkezés szükséges" });

    const user = JSON.parse(session);
    const cart = request.body.cart;

    if (!Array.isArray(cart) || cart.length === 0) {
      return reply.code(400).send({ error: "Üres kosár" });
    }

    try {
      for (const item of cart) {
        const product = await dbGet(`SELECT * FROM products WHERE id = ?`, [item.id]);
        if (!product || product.stock < item.quantity) {
          return reply.code(400).send({ error: "Nincs elég készlet" });
        }
      }

      const now = new Date().toISOString();
      const { lastID: orderId } = await runWithLastID(
        `INSERT INTO orders (user_id, total_price, created_at) VALUES (?, ?, ?)`,
        [user.userId, 0, now]
      );

      let total = 0;

      for (const item of cart) {
        const product = await dbGet(`SELECT * FROM products WHERE id = ?`, [item.id]);
        const itemTotal = product.price * item.quantity;
        total += itemTotal;

        await dbRun(
          `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
          [orderId, item.id, item.quantity, product.price]
        );

        await dbRun(
          `UPDATE products SET stock = stock - ? WHERE id = ?`,
          [item.quantity, item.id]
        );
      }

      await dbRun(`UPDATE orders SET total_price = ? WHERE id = ?`, [total, orderId]);

      console.log(`[RENDELÉS] ${user.username} rendelt ${total} Ft értékben.`);

      reply.send({
        success: true,
        orderId,
        total
      });
    } catch (err) {
      console.error("Rendelés hiba:", err);
      reply.code(500).send({ error: "Szerver hiba" });
    }
  });
}

module.exports = orderRoutes;
