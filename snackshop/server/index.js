const Fastify = require("fastify");
const cors = require("@fastify/cors");
const cookie = require("@fastify/cookie");


const app = Fastify({ logger: true });

app.register(cors, {
  origin: true,
  credentials: true
});
app.register(cookie);
app.register(require('./routes/auth'));
app.register(require('./routes/products'));
app.register(require('./routes/orders'));
app.get("/", async (req, reply) => {
  return { message: "SnackShop backend működik!" };
});

app.listen({ port: 5000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Backend elindult: ${address}`);
});
require("./db");