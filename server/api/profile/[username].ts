export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username");

  if (!username) {
    throw createError({
      statusCode: 401,
      message: "Please provide a valid value",
    });
  }

  const cleanedUsername = username.startsWith("@")
    ? username.slice(1)
    : username;

  try {
    const publicUser = getPublicUserProfileWithUsername(cleanedUsername);
    if (!publicUser) {
      throw createError({
        statusCode: 404,
        message: "User not found",
      });
    }
    return publicUser;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }
});
