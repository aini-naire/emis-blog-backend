import fp from "fastify-plugin";
import { BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from 'bun:sqlite';
import { FastifyInstance, FastifyPluginAsync } from "fastify";

import * as schema from "@blog/database/schema.js";

declare module "fastify" {
  interface FastifyInstance {
    db: BunSQLiteDatabase<typeof schema>;
  }
}

const sqlite = new Database("data/sqlite.db");
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
