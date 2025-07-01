import { relations } from "drizzle-orm";
import { photo } from "./schema";
import { user, session, account, verification } from "./authSchema";

// User Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  photos: many(photo),
  verifications: many(verification),
}));

// Session Relations
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

// Account Relations
export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// Verification Relations
// export const verificationRelations = relations(verification, ({ one }) => ({
//   user: one(user, {
//     fields: [verification.id],
//     references: [user.id],
//   }),
// }));

// Photo Relations
export const photoRelations = relations(photo, ({ one }) => ({
  user: one(user, {
    fields: [photo.userId],
    references: [user.id],
  }),
}));
