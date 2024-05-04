import { sql, relations } from "drizzle-orm";
import { text, sqliteTable } from "drizzle-orm/sqlite-core";

export const profile = sqliteTable("profile", {
  id: text("id").primaryKey(),
  userId: text("user_id").unique().notNull(),
  username: text("username").unique().notNull(),
  bio: text("bio"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const profileRelation = relations(profile, ({ many }) => ({
  photos: many(photo),
}));

export const photo = sqliteTable("photo", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title"),
  url: text("url").notNull(),
  profileId: text("profile_id").references(() => profile.id),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const photoRelation = relations(photo, ({ one }) => ({
  profile: one(profile, {
    fields: [photo.profileId],
    references: [profile.id],
  }),
}));
