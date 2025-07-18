import { users } from "~~/server/db/schema";

export const createUser = async (value: typeof users.$inferInsert) => {
  const [user] = await useDb().insert(users).values(value).returning();
  return user;
};
