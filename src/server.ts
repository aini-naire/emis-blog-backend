import { fastify, FastifyInstance } from "fastify";
import Env from "@fastify/env";
import AutoLoad from "@fastify/autoload";
import { join } from "desm";

import { databasePlugin } from "@blog/plugins/database.js";
import swagger from "@blog/plugins/swagger.js";

const confSchema = {
  type: "object",
  required: ["NODE_ENV", "PORT"],
  properties: {
    NODE_ENV: {type: "string",},
    PORT: {type: "number",},
  },
};

const main = async () => {
  const f = fastify({
    logger: true
  });

  f.log.info("Setting up plugins");
  await f.register(Env, { schema: confSchema, dotenv: true });
  await f.register(databasePlugin);
  if (f.config.NODE_ENV !== "production") {
    f.register(swagger);
  }

  f.log.info("Registering routes");
  await f.register(AutoLoad, {
    dir: join(import.meta.url, "routes"),
    dirNameRoutePrefix: true,
  });


  f.log.info("Listening on port "+f.config.PORT);
  await f.listen({ port: f.config.PORT });
};

await main();
