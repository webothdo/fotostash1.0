import {
  text,
  sqliteTable,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$default(() => nanoid()),
  kindeId: text("kinde_id").notNull(),
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
  description: text("description"),
  slug: text("slug")
    .unique()
    .$defaultFn(() => nanoid()),
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
},
(table) => [
  index("photos_approved_created_idx").on(table.approved, table.createdAt),
  index("photos_user_created_idx").on(table.userId, table.createdAt),
]);

export const likes = sqliteTable(
  "likes",
  {
    id: text("id")
      .primaryKey()
      .$default(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    photoId: text("photo_id")
      .notNull()
      .references(() => photos.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("likes_user_photo_unique").on(table.userId, table.photoId),
    index("likes_photo_idx").on(table.photoId),
    index("likes_user_created_idx").on(table.userId, table.createdAt),
  ]
);

export const collections = sqliteTable(
  "collections",
  {
    id: text("id")
      .primaryKey()
      .$default(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    isPrivate: integer("is_private", { mode: "boolean" })
      .default(true)
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [index("collections_user_idx").on(table.userId, table.updatedAt)]
);

export const collectionPhotos = sqliteTable(
  "collection_photos",
  {
    id: text("id")
      .primaryKey()
      .$default(() => nanoid()),
    collectionId: text("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    photoId: text("photo_id")
      .notNull()
      .references(() => photos.id, { onDelete: "cascade" }),
    addedAt: integer("added_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("collection_photos_unique").on(
      table.collectionId,
      table.photoId
    ),
    index("collection_photos_photo_idx").on(table.photoId),
  ]
);
