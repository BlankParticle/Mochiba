import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  casing: "snake_case",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dbCredentials: {
    // @ts-expect-error
    url: process.env.LOCAL_DB_PATH,
  },
});
