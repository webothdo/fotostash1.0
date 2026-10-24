import { relations } from "drizzle-orm";
import {
  collectionPhotos,
  collections,
  likes,
  photos,
  users,
} from "./schema";

// User Relations
export const userRelations = relations(users, ({ many }) => ({
  photos: many(photos),
  likes: many(likes),
  collections: many(collections),
}));

// Photo Relations
export const photoRelations = relations(photos, ({ one, many }) => ({
  user: one(users, {
    fields: [photos.userId],
    references: [users.id],
  }),
  likes: many(likes),
  collectionPhotos: many(collectionPhotos),
}));

export const likeRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  photo: one(photos, {
    fields: [likes.photoId],
    references: [photos.id],
  }),
}));

export const collectionRelations = relations(
  collections,
  ({ one, many }) => ({
    user: one(users, {
      fields: [collections.userId],
      references: [users.id],
    }),
    photos: many(collectionPhotos),
  })
);

export const collectionPhotoRelations = relations(
  collectionPhotos,
  ({ one }) => ({
    collection: one(collections, {
      fields: [collectionPhotos.collectionId],
      references: [collections.id],
    }),
    photo: one(photos, {
      fields: [collectionPhotos.photoId],
      references: [photos.id],
    }),
  })
);
