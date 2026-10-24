export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const username = getRouterParam(event, "username");

  if (!username) {
    throw createError({ statusCode: 400, message: "Username is required" });
  }

  const cleaned = username.startsWith("@") ? username.slice(1) : username;
  const target = await useDb().query.users.findFirst({
    where: (user, { eq }) => eq(user.username, cleaned),
    columns: { id: true },
  });

  if (!target) {
    throw createError({ statusCode: 404, message: "User not found" });
  }

  try {
    setHeader(event, "cache-control", "private, no-store");
    return await toggleFollow(user.id, target.id);
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) throw error;

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }
});
