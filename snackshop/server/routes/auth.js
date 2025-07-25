const bcrypt = require("bcrypt");
const db = require("../db");
const util = require("util");

const dbRun = util.promisify(db.run.bind(db));
const dbGet = util.promisify(db.get.bind(db));
const dbAll = util.promisify(db.all.bind(db));

async function authRoutes(fastify, options) {

  fastify.post("/api/register", async (request, reply) => {
    const { username, password } = request.body;

    if (!username || !password) {
      console.warn("Hiányzó regisztrációs adatok:", request.body);
      return reply.code(400).send({ error: "Hiányzó adatok" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      await dbRun(
        `INSERT INTO users (username, password, is_admin) VALUES (?, ?, 0)`,
        [username, hashedPassword]
      );

      console.log("Sikeres regisztráció:", username);
      return reply.send({ success: true });

    } catch (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        console.warn("Felhasználónév már létezik:", username);
        return reply.code(400).send({ error: "Felhasználónév foglalt" });
      }

      console.error("Regisztrációs hiba:", err);
      return reply.code(500).send({ error: "Szerverhiba" });
    }
  });

  fastify.delete("/api/users/:id", async (request, reply) => {
  const { id } = request.params;

  try {
    const result = await dbRun(`DELETE FROM users WHERE id = ?`, [id]);
    console.log(`Felhasználó törölve: ${id}`);

    return reply.send({ success: true });
  } catch (err) {
    console.error("Törlési hiba:", err.message);
    return reply.code(500).send({ error: "Nem sikerült törölni a felhasználót" });
  }
});



  fastify.get("/api/users", async (request, reply) => {
    try {
      console.log("Lekérés: /api/users");
      const users = await dbAll(`SELECT id, username, is_admin FROM users`);
      console.log("Felhasználók lekérve:", users);
      return reply.send(users);
    } catch (err) {
      console.error("Felhasználó lekérési hiba:", err);
      return reply.code(500).send({ error: "Nem sikerült lekérni a felhasználókat." });
    }
  });

  fastify.post("/api/login", async (request, reply) => {
    const { username, password } = request.body;

    if (!username || !password) {
      console.warn("Hiányzó bejelentkezési adatok:", request.body);
      return reply.code(400).send({ error: "Hiányzó adatok" });
    }

    try {
      const user = await dbGet(
        `SELECT * FROM users WHERE username = ?`,
        [username]
      );

      if (!user) {
        console.warn("Nincs ilyen felhasználó:", username);
        return reply.code(401).send({ error: "Hibás felhasználó/jelszó" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        console.warn("Hibás jelszó próbálkozás:", username);
        return reply.code(401).send({ error: "Hibás felhasználó/jelszó" });
      }

      reply.setCookie(
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
      );

      console.log("Sikeres bejelentkezés:", username);

      return reply.send({
        id: user.id,
        username: user.username,
        email: user.email || "",
        isAdmin: !!user.is_admin,
        authenticated: true
      });

    } catch (err) {
      console.error("Bejelentkezési hiba:", err);
      return reply.code(500).send({ error: "Szerverhiba" });
    }
  });
}

module.exports = authRoutes;
