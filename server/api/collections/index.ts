export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readBody<{
    name?: string;
    description?: string;
    isPrivate?: boolean;
  }>(event);

  const name = String(body?.name ?? "")
    .trim()
    .slice(0, 80);
  const description = String(body?.description ?? "")
    .trim()
    .slice(0, 300);

  if (name.length < 2) {
    throw createError({
      statusCode: 400,
      message: "Collection names need at least 2 characters",
    });
  }

  try {
    const collection = await createCollection(user.id, {
      name,
      description: description || null,
      isPrivate: body?.isPrivate ?? true,
    });

    setHeader(event, "cache-control", "private, no-store");
    return collection;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }
});
