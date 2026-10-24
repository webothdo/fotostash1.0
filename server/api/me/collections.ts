export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const query = getQuery(event);
  const photoId =
    typeof query.photoId === "string" && query.photoId.length > 0
      ? query.photoId
      : undefined;

  try {
    setHeader(event, "cache-control", "private, no-store");

    if (photoId) {
      return await getCollectionsForPhoto(user.id, photoId);
    }

    return await listOwnCollections(user.id);
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }
});
