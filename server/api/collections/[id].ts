import { getLoggedInUser } from "~~/server/utils/actions/user/query";
import { getOptionalKindeUser } from "~~/server/utils/getOptionalKindeUser";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({ statusCode: 400, message: "Collection ID is required" });
  }

  if (event.method === "GET") {
    const session = await getOptionalKindeUser(event);
    const viewer = session ? await getLoggedInUser(session.id) : null;
    const collection = await getCollectionById(id, viewer?.id);

    if (!collection) {
      throw createError({ statusCode: 404, message: "Collection not found" });
    }

    setHeader(event, "cache-control", "private, no-store");
    return collection;
  }

  const user = await requireUser(event);

  if (event.method === "PATCH") {
    const body = await readBody<{
      name?: string;
      description?: string;
      isPrivate?: boolean;
    }>(event);

    const data: {
      name?: string;
      description?: string | null;
      isPrivate?: boolean;
    } = {};

    if (typeof body?.name === "string") {
      const name = body.name.trim().slice(0, 80);
      if (name.length < 2) {
        throw createError({
          statusCode: 400,
          message: "Collection names need at least 2 characters",
        });
      }
      data.name = name;
    }

    if (typeof body?.description === "string") {
      data.description = body.description.trim().slice(0, 300) || null;
    }

    if (typeof body?.isPrivate === "boolean") {
      data.isPrivate = body.isPrivate;
    }

    const updated = await updateCollection(id, user.id, data);

    if (!updated) {
      throw createError({ statusCode: 404, message: "Collection not found" });
    }

    return updated;
  }

  if (event.method === "DELETE") {
    const deleted = await deleteCollection(id, user.id);

    if (!deleted) {
      throw createError({ statusCode: 404, message: "Collection not found" });
    }

    return { success: true };
  }

  throw createError({ statusCode: 405, message: "Method not allowed" });
});
