import { sql } from "drizzle-orm";
import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core";
import { user } from "./authSchema";

export const photo = sqliteTable("photo", {
  id: text("id").primaryKey(),
  title: text("title"),
  url: text("url").notNull(),
  approved: integer("approved", { mode: "boolean" }).default(false),
  rejected: integer("rejected", { mode: "boolean" }).default(false),
  featured: integer("featured", { mode: "boolean" }).default(false),
  userId: text("user_id")
    .references(() => user.id, {
      onDelete: "no action",
    })
    .notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => sql`CURRENT_TIMESTAMP`),
});
