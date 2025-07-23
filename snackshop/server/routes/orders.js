const util = require("util");
const db = require("../db");

const dbGet = util.promisify(db.get.bind(db));
const dbRun = util.promisify(db.run.bind(db));
const dbAll = util.promisify(db.all.bind(db));

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

    let user;
    try {
      user = JSON.parse(session);
    } catch {
      return reply.code(400).send({ error: "Érvénytelen munkamenet" });
    }

    const cart = request.body.cart;

    console.log("Kapott kosár:", cart);
    console.log("Felhasználó:", user);

    if (!Array.isArray(cart) || cart.length === 0) {
      return reply.code(400).send({ error: "Üres kosár" });
    }

    try {
      for (const item of cart) {
        const product = await dbGet(`SELECT * FROM products WHERE id = ?`, [item.id]);
        if (!product || product.stock < item.quantity) {
          return reply.code(400).send({ error: `Nincs elég készlet a(z) ${product?.name || "ismeretlen"} termékhez.` });
        }
      }

      const now = new Date().toISOString();
      const { lastID: orderId } = await runWithLastID(
        `INSERT INTO orders (user_id, total_price, created_at) VALUES (?, ?, ?)`,
        [user.id, 0, now] // ⬅️ Changed user.userId to user.id
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
      reply.code(500).send({ error: "Szerver hiba", details: err.message });
    }
  });

  fastify.get("/api/orders", async (request, reply) => {
  const session = request.cookies.session;
  if (!session) return reply.code(403).send({ error: "Bejelentkezés szükséges" });

  let user;
  try {
    user = JSON.parse(session);
  } catch {
    return reply.code(400).send({ error: "Érvénytelen munkamenet" });
  }

  if (!user.isAdmin) {
    return reply.code(403).send({ error: "Csak adminisztrátorok tekinthetik meg az összes rendelést." });
  }

  try {
    const orders = await dbAll(
      `SELECT o.id, o.total_price, o.created_at,
              u.username,
              GROUP_CONCAT(p.name || ' x' || oi.quantity, ', ') AS items
       FROM orders o
       JOIN users u ON u.id = o.user_id
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON p.id = oi.product_id
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    );

    console.log("Adminként lekért összes rendelés:", orders);
    reply.send(orders);
  } catch (err) {
    console.error("Hiba az összes rendelés lekérdezésénél:", err);
    reply.code(500).send({ error: "Szerver hiba", details: err.message });
  }
});

}

module.exports = orderRoutes;
