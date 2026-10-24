export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const id = getRouterParam(event, "id");
  const photoId = getRouterParam(event, "photoId");

  if (!id || !photoId) {
    throw createError({
      statusCode: 400,
      message: "Collection ID and photo ID are required",
    });
  }

  const removed = await removePhotoFromCollection(id, user.id, photoId);

  if (!removed) {
    throw createError({ statusCode: 404, message: "Collection not found" });
  }

  return { success: true };
});
