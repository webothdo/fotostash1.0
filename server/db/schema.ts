import { sql } from "drizzle-orm";
import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core";
import { user } from "./authSchema";

export const profile = sqliteTable("profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  username: text("username").unique().notNull(),
  bio: text("bio"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => sql`CURRENT_TIMESTAMP`),
});

export const photo = sqliteTable("photo", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title"),
  url: text("url").notNull(),
  approved: integer("approved", { mode: "boolean" }).default(false),
  rejected: integer("rejected", { mode: "boolean" }).default(false),
  featured: integer("featured", { mode: "boolean" }).default(false),
  profileId: text("profile_id")
    .references(() => profile.id, {
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
