import { eq } from "drizzle-orm";
import { profile } from "~/server/database/schema";
export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username");

  //check profile exist
  try {
    const user = await db.query.profile.findFirst({
      where: eq(profile.username, username),
    });

    return user;
  } catch (error) {
    throw new Error(error.message);
  }
});
