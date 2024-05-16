import { profile } from "../database/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export default defineEventHandler(async (event) => {
  //check profile exist
  const body = await readBody(event);

  // TODO: check if user exist when they
  // manually create a profile
  // const profileExist = await db.query.profile.findFirst({
  //   where: eq(profile.username, "@weboto"),
  // });

  let genUsername = "@user" + uuidv4();

  try {
    await db.insert(profile).values({
      id: uuidv4(),
      userId: body.id,
      username: genUsername,
    });
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
