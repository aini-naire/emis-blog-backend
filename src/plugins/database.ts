import fp from "fastify-plugin";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { FastifyInstance, FastifyPluginAsync } from "fastify";

import * as schema from "@blog/database/schema.js";

declare module "fastify" {
  interface FastifyInstance {
    db: BetterSQLite3Database<typeof schema>;
  }
}

const sqlite = new Database("sqlite.db");
const database = drizzle(sqlite, { schema });

const databasePlugin = fp(
  async (fastify: FastifyInstance) => {
    fastify.decorate("db", database);

    fastify.addHook("onClose", async () => {
      await sqlite.close();
    });
  },
  {
    name: "database",
  }
);

export { database, databasePlugin }
