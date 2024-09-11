import { fastify, FastifyInstance } from "fastify";
import Env from "@fastify/env";
import AutoLoad from "@fastify/autoload";
import { join } from "desm";

import { databasePlugin } from "@blog/plugins/database.js";
import swagger from "@blog/plugins/swagger.js";
import { JWT, fastifyJwt } from "@fastify/jwt";
import { Static, Type } from "@fastify/type-provider-typebox";

type ConfigSchema = Static<typeof ConfigSchema>
const ConfigSchema = Type.Object({
  NODE_ENV: Type.Union([Type.Literal('dev'), Type.Literal('production')]),
  PORT: Type.Number(),
  JWT_SECRET: Type.String()
})

declare module "fastify" {
  interface FastifyInstance {
    jwt: JWT;
    config: ConfigSchema
  }
}

const main = async () => {
  const f = fastify({
    logger: true
  });

  f.log.info("Setting up plugins");
  await f.register(Env, { schema: ConfigSchema, dotenv: true });
  f.register(databasePlugin);
  f.register(fastifyJwt, {
    secret: f.config.JWT_SECRET
  })
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
