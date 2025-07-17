import { eq } from "drizzle-orm";
import { user } from "~~/server/db/authSchema";

export const updateUser = async (
  id: string,
  data: typeof user.$inferInsert
) => {
  const updatedUser = await useDb()
    .update(user)
    .set(data)
    .where(eq(user.id, id));
  return updatedUser;
};
