import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$default(() => nanoid()),
  userId: text("user_id").notNull(),
  name: text("name"),
  email: text("email"),
  username: text("username").unique(),
  picture: text("picture"),
  displayUsername: text("display_username"),
  role: text("role").default("user").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  bio: text("bio"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export const photos = sqliteTable("photos", {
  id: text("id")
    .primaryKey()
    .$default(() => nanoid()),
  title: text("title"),
  url: text("url").notNull(),
  tags: text("tags", { mode: "json" }),
  height: integer("height").default(600).notNull(),
  width: integer("width"),
  approved: integer("approved", { mode: "boolean" }).default(false),
  rejected: integer("rejected", { mode: "boolean" }).default(false),
  featured: integer("featured", { mode: "boolean" }).default(false),
  userId: text("user_id")
    .references(() => users.id, {
      onDelete: "no action",
    })
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});
