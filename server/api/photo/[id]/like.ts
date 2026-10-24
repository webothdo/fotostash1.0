export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const photoId = getRouterParam(event, "id");

  if (!photoId) {
    throw createError({ statusCode: 400, message: "Photo ID is required" });
  }

  const photo = await useDb().query.photos.findFirst({
    where: (photo, { and, eq }) =>
      and(eq(photo.id, photoId), eq(photo.approved, true)),
    columns: { id: true },
  });

  if (!photo) {
    throw createError({ statusCode: 404, message: "Photo not found" });
  }

  try {
    return await togglePhotoLike(user.id, photo.id);
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }
});
