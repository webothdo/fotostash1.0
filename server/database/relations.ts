import { relations } from "drizzle-orm";
import { photo, profile } from "./schema";

export const profileRelation = relations(profile, ({ many }) => ({
  photos: many(photo),
}));

export const photoRelation = relations(photo, ({ one }) => ({
  profile: one(profile, {
    fields: [photo.profileId],
    references: [profile.id],
  }),
}));
