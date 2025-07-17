import { relations } from "drizzle-orm";
import { photos, users } from "./schema";

// User Relations
export const userRelations = relations(users, ({ many }) => ({
  photos: many(photos),
}));

// Photo Relations
export const photoRelations = relations(photos, ({ one }) => ({
  user: one(users, {
    fields: [photos.userId],
    references: [users.id],
  }),
}));
