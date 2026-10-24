export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const id = getRouterParam(event, "id");
  const body = await readBody<{ photoId?: string }>(event);
  const photoId = String(body?.photoId ?? "").trim();

  if (!id || !photoId) {
    throw createError({
      statusCode: 400,
      message: "Collection ID and photo ID are required",
    });
  }

  const added = await addPhotoToCollection(id, user.id, photoId);

  if (!added) {
    throw createError({ statusCode: 404, message: "Collection not found" });
  }

  return { success: true };
});
