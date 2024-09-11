import type { Config } from "drizzle-kit";

export default {
  dialect: "sqlite",
  schema: "./src/database/schema.ts",
  out: "./drizzle",
  verbose: true,
  strict: true,
  url: "./sqlite.db"
} satisfies Config;
