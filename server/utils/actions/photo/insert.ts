import { photos } from "~~/server/db/schema";

export const createPhoto = async (value: typeof photos.$inferInsert) => {
  const photo = await useDb().insert(photos).values(value).returning();
  return photo;
};
