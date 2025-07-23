const db = require("../db");

async function productRoutes(fastify, options) {
  fastify.get("/api/products", async (request, reply) => {
  return new Promise((resolve) => {
    db.all(`SELECT * FROM products`, (err, rows) => {
      if (err) {
        reply.code(500).send({ error: "DB hiba" });
        return resolve();
      }
      reply.send(rows);
      resolve();
    });
  });
});

  fastify.addHook("preHandler", (request, reply, done) => {
  const session = request.cookies.session;
  if (
    typeof request.routerPath === "string" &&
    request.routerPath.startsWith("/api/products") &&
    request.method !== "GET"
  ) {
    if (!session) return reply.code(403).send({ error: "Nincs jogosultság" });
    const user = JSON.parse(session);
    if (!user.isAdmin) return reply.code(403).send({ error: "Admin only" });
  }
  done();
});

  fastify.post("/api/products", async (request, reply) => {
    const { name, price, stock } = request.body;
    db.run(
      `INSERT INTO products (name, price, stock) VALUES (?, ?, ?)`,
      [name, price, stock],
      function (err) {
        if (err) return reply.code(500).send({ error: "Hiba" });
        reply.send({ id: this.lastID });
      }
    );
  });

  fastify.put("/api/products/:id", async (request, reply) => {
    const { name, price, stock } = request.body;
    const id = request.params.id;
    db.run(
      `UPDATE products SET name=?, price=?, stock=? WHERE id=?`,
      [name, price, stock, id],
      function (err) {
        if (err) return reply.code(500).send({ error: "Hiba" });
        reply.send({ success: true });
      }
    );
  });

  fastify.delete("/api/products/:id", async (request, reply) => {
    const id = request.params.id;
    db.run(`DELETE FROM products WHERE id=?`, [id], function (err) {
      if (err) return reply.code(500).send({ error: "Hiba" });
      reply.send({ success: true });
    });
  });
}

module.exports = productRoutes;
