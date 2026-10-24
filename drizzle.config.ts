import { defineConfig } from "drizzle-kit";
import process from "node:process";

export default defineConfig({
  dialect: "turso",
  schema: ["./server/db/schema.ts"],
  out: "./server/db/migrations",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
