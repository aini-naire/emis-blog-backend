import fp from "fastify-plugin";
import { BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from 'bun:sqlite';
import { FastifyInstance, FastifyPluginAsync } from "fastify";

import * as schema from "@blog/database/schema.js";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

declare module "fastify" {
    interface FastifyInstance {
        db: BunSQLiteDatabase<typeof schema>;
    }
}
let sqlite: Database;
let database: BunSQLiteDatabase<typeof schema>;
if (process.env.NODE_ENV !== "test") {
    sqlite = new Database("data/sqlite.db");
    database = drizzle(sqlite, { schema });
} else {
    sqlite = new Database(":memory:");
    database = drizzle(sqlite, { schema });
    await migrate(database, { migrationsFolder: "drizzle" });
}

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
