import { z } from "zod";
import { updateUser } from "~~/server/utils/actions/user/update";
import { getLoggedInUser } from "~~/server/utils/actions/user/query";

const usernameSchema = z.object({
  username: z.string().min(5, {
    message: "Username must be at least 5 characters long",
  }),
});

export default defineEventHandler(async (event) => {
  try {
    const session = await event.context.kinde.getUserProfile();
    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    const body = await readValidatedBody(event, usernameSchema.safeParse);
    if (!body.success) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: body.error.message,
      });
    }
    const loggedInUser = await getLoggedInUser(session.id);
    const photos = await updateUser(loggedInUser?.id!, {
      username: body.data.username,
    });
    return photos;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }
});
