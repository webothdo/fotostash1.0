import { sql, relations } from "drizzle-orm";
import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core";

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
  approved: integer("approved", { mode: "boolean" }).default(false),
  rejected: integer("rejected", { mode: "boolean" }).default(false),
  profileId: text("profile_id")
    .references(() => profile.id, {
      onDelete: "cascade",
    })
    .notNull(),
  approvedPhotoId: text("approved_photo_id").references(() => approvedPhoto.id),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const approvedPhoto = sqliteTable("approved_photo", {
  id: text("id").primaryKey(),
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

export const approvedPhotoRelation = relations(approvedPhoto, ({ many }) => ({
  photos: many(photo),
}));
