import { eq } from "drizzle-orm";
import { users } from "~~/server/db/schema";

export const updateUser = async (
  id: string,
  data: Omit<typeof users.$inferInsert, "userId">
) => {
  const updatedUser = await useDb()
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning();
  return updatedUser;
};
