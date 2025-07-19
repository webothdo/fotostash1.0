import { isUsernameAvailable } from "~~/server/utils/actions/username";

export default defineEventHandler(async (event) => {
  const username = getQuery(event).username as string;
  if (!username) {
    throw createError({
      statusCode: 400,
      message: "Username is required",
    });
  }

  console.log(username);
  try {
    const isAvailable = await isUsernameAvailable(username);
    return { isAvailable };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }
});
