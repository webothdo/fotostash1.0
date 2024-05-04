import { eq } from "drizzle-orm";
import { profile } from "~/server/database/schema";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  try {
    const user = await db.query.profile.findFirst({
      where: eq(profile.userId, query.id),
    });

    if (!user) {
      return "User not found";
    }
    return user;
  } catch (error) {
    return error;
  }
});
