const util = require("util");
const db   = require("../db");

const dbGet = util.promisify(db.get.bind(db));
const dbRun = util.promisify(db.run.bind(db));
const dbAll = util.promisify(db.all.bind(db));

function runWithLastID(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID });
    });
  });
}

async function orderRoutes(fastify, options) {
  fastify.post("/api/order", async (request, reply) => {
    const session = request.cookies.session;
    if (!session) {
      return reply.code(403).send({ error: "Bejelentkezés szükséges" });
    }

    let user;
    try {
      user = JSON.parse(session);
    } catch {
      return reply.code(400).send({ error: "Érvénytelen munkamenet" });
    }

    const cart = request.body.cart;
    if (!Array.isArray(cart) || cart.length === 0) {
      return reply.code(400).send({ error: "Üres kosár" });
    }

    try {
      for (const item of cart) {
        const product = await dbGet(
          `SELECT * FROM products WHERE id = ?`,
          [item.id]
        );
        if (!product || product.stock < item.quantity) {
          return reply.code(400).send({
            error: `Nincs elég készlet a(z) ${product?.name || "ismeretlen"} termékhez.`,
          });
        }
      }

      const now = new Date().toISOString();
      const { lastID: orderId } = await runWithLastID(
        `INSERT INTO orders (user_id, total_price, created_at)
         VALUES (?, ?, ?)`,
        [user.userId, 0, now]
      );

      let total = 0;

      for (const item of cart) {
        const product = await dbGet(
          `SELECT * FROM products WHERE id = ?`,
          [item.id]
        );
        const lineTotal = product.price * item.quantity;
        total += lineTotal;

        await dbRun(
          `INSERT INTO order_items
             (order_id, product_id, product_name, quantity, price)
           VALUES (?, ?, ?, ?, ?)`,
          [
            orderId,
            item.id,
            product.name,
            item.quantity,
            product.price
          ]
        );

        await dbRun(
          `UPDATE products SET stock = stock - ? WHERE id = ?`,
          [item.quantity, item.id]
        );
      }

      await dbRun(
        `UPDATE orders SET total_price = ? WHERE id = ?`,
        [total, orderId]
      );

      return reply.send({ success: true, orderId, total });
    } catch (err) {
      console.error("Rendelés hiba:", err);
      return reply.code(500).send({ error: "Szerver hiba", details: err.message });
    }
  });

  fastify.get("/api/orders", async (request, reply) => {
    const session = request.cookies.session;
    if (!session) {
      return reply.code(403).send({ error: "Bejelentkezés szükséges" });
    }

    let user;
    try {
      user = JSON.parse(session);
    } catch {
      return reply.code(400).send({ error: "Érvénytelen munkamenet" });
    }

    if (!user.isAdmin) {
      return reply
        .code(403)
        .send({ error: "Csak adminisztrátorok tekinthetik meg az összes rendelést." });
    }

    try {
      const orders = await dbAll(
        `SELECT 
           o.id,
           o.total_price,
           o.created_at,
           u.username,
           GROUP_CONCAT(
             oi.product_name || ' x' || oi.quantity,
             ', '
           ) AS items
         FROM orders o
         JOIN users u       ON u.id       = o.user_id
         JOIN order_items oi ON oi.order_id = o.id
         GROUP BY o.id
         ORDER BY o.created_at DESC`
      );
      return reply.send(orders);
    } catch (err) {
      console.error("Hiba az összes rendelés lekérdezésénél:", err);
      return reply.code(500).send({ error: "Szerver hiba", details: err.message });
    }
  });
}

module.exports = orderRoutes;
