const bcrypt = require("bcrypt");
const db = require("../db");
const util = require("util");

const dbRun = util.promisify(db.run.bind(db));
const dbGet = util.promisify(db.get.bind(db));

async function authRoutes(fastify, options) {
  fastify.post("/api/register", async (request, reply) => {
    const { username, password } = request.body;

    if (!username || !password) {
      return reply.code(400).send({ error: "Hiányzó adatok" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      await dbRun(
        `INSERT INTO users (username, password, is_admin) VALUES (?, ?, 0)`,
        [username, hashedPassword]
      );

      return reply.send({ success: true });

    } catch (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return reply.code(400).send({ error: "Felhasználónév foglalt" });
      }

      console.error(err);
      return reply.code(500).send({ error: "Szerverhiba" });
    }
  });

  fastify.post("/api/login", async (request, reply) => {
    const { username, password } = request.body;

    if (!username || !password) {
      return reply.code(400).send({ error: "Hiányzó adatok" });
    }

    try {
      const user = await dbGet(
        `SELECT * FROM users WHERE username = ?`,
        [username]
      );

      if (!user) {
        return reply.code(401).send({ error: "Hibás felhasználó/jelszó" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return reply.code(401).send({ error: "Hibás felhasználó/jelszó" });
      }

      return reply
        .setCookie(
          "session",
          JSON.stringify({
            userId: user.id,
            username: user.username,
            isAdmin: !!user.is_admin
          }),
          {
            httpOnly: true,
            path: "/"
          }
        )
        .send({
          authenticated: true,
          isAdmin: !!user.is_admin
        });

    } catch (err) {
      console.error(err);
      return reply.code(500).send({ error: "Szerverhiba" });
    }
  });
}

module.exports = authRoutes;
