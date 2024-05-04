import { profile } from "../database/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  //check profile exist
  const profileExist = await db.query.profile.findFirst({
    where: eq(profile.username, "@weboto"),
  });

  if (profileExist) {
    return profileExist;
  } else {
    try {
      await db.insert(profile).values({
        id: "data2",
        userId: "662d2b7d0031a1dfd95c",
        username: "@we",
      });
    } catch (error) {
      console.log(error);
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      });
    }
  }
});
