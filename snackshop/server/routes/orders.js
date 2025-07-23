const db = require("../db");

async function orderRoutes(fastify, options) {
  fastify.post("/api/order", async (request, reply) => {
    const session = request.cookies.session;
    if (!session) return reply.code(403).send({ error: "Bejelentkezés szükséges" });
    const user = JSON.parse(session);

    const cart = request.body.cart;
    if (!Array.isArray(cart) || cart.length === 0) {
      return reply.code(400).send({ error: "Üres kosár" });
    }

    db.serialize(() => {
      let total = 0;
      let valid = true;

      for (let item of cart) {
        db.get(`SELECT * FROM products WHERE id = ?`, [item.id], (err, row) => {
          if (!row || row.stock < item.quantity) {
            valid = false;
          }
        });
      }

      if (!valid) return reply.code(400).send({ error: "Nem megfelelő készlet" });

      const now = new Date().toISOString();
      db.run(
        `INSERT INTO orders (user_id, total_price, created_at) VALUES (?, ?, ?)`,
        [user.userId, 0, now],
        function (err) {
          if (err) return reply.code(500).send({ error: "DB hiba" });

          const orderId = this.lastID;
          for (let item of cart) {
            db.get(`SELECT * FROM products WHERE id = ?`, [item.id], (err, product) => {
              const price = product.price * item.quantity;
              total += price;

              db.run(
                `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
                [orderId, item.id, item.quantity, product.price]
              );

              db.run(
                `UPDATE products SET stock = stock - ? WHERE id = ?`,
                [item.quantity, item.id]
              );
            });
          }

          db.run(`UPDATE orders SET total_price = ? WHERE id = ?`, [total, orderId]);
          console.log(`[RENDELÉS] ${user.username} rendelt ${total} Ft értékben.`);

          reply.send({
            success: true,
            orderId,
            total
          });
        }
      );
    });
  });

  fastify.get("/api/orders", (request, reply) => {
    const session = request.cookies.session;
    if (!session) return reply.code(403).send({ error: "Nincs jogosultság" });
    const user = JSON.parse(session);
    if (!user.isAdmin) return reply.code(403).send({ error: "Admin only" });

    db.all(
      `SELECT o.id, u.username, o.total_price, o.created_at 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC`,
      (err, rows) => {
        if (err) return reply.code(500).send({ error: "DB hiba" });
        reply.send(rows);
      }
    );
  });
}

module.exports = orderRoutes;
