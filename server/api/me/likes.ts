export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const query = getQuery(event);
  const requestedLimit = Number(query.limit);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(48, Math.max(1, Math.trunc(requestedLimit)))
    : 24;
  const cursor =
    typeof query.cursor === "string" && query.cursor.length > 0
      ? query.cursor
      : undefined;

  try {
    setHeader(event, "cache-control", "private, no-store");
    return await getLikedPhotoPage(user.id, { limit, cursor });
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }
});
