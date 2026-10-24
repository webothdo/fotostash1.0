import { getAllPhotos } from "~~/server/utils/actions/photo/query";
import { getLoggedInUser } from "~~/server/utils/actions/user/query";
import { getOptionalKindeUser } from "~~/server/utils/getOptionalKindeUser";

export default defineEventHandler(async (event) => {
  const session = await getOptionalKindeUser(event);

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const user = await getLoggedInUser(session.id);

  if (user?.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  try {
    return await getAllPhotos();
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }
});
