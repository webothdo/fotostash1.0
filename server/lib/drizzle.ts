import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import process from "node:process";

import * as schema from "../db/schema";
import * as relations from "../db/relations";
import * as authSchema from "../db/authSchema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, {
  schema: { ...schema, authSchema, ...relations },
});
