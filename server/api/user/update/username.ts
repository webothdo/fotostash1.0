import { z } from "zod";
import { updateUser } from "~~/server/utils/actions/user/update";
import { getLoggedInUser } from "~~/server/utils/actions/user/query";

const usernameSchema = z.object({
  username: z.string().min(5, {
    message: "Username must be at least 5 characters long",
  }),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, usernameSchema.safeParse);
  try {
    const session = await event.context.kinde.getUserProfile();
    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    if (!body.success) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: body.error.message,
      });
    }
    const isAvailable = await isUsernameAvailable(body.data.username);
    if (!isAvailable) {
      throw createError({
        statusCode: 400,
        statusMessage: "Username is not available",
      });
    }

    const loggedInUser = await getLoggedInUser(session.id);
    const removeOldUsername = await removeUsername(loggedInUser?.username!);
    const photos = await updateUser(loggedInUser?.id!, {
      username: body.data.username,
    });
    const added = await addUsername(body.data.username);
    return photos;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }
});
