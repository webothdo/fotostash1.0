import { getPhotoBySlugWithUser } from "~~/server/utils/actions/photo/query";
import { getLoggedInUser } from "~~/server/utils/actions/user/query";
import { getOptionalKindeUser } from "~~/server/utils/getOptionalKindeUser";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: "Please provide a valid value",
    });
  }

  let singlePhoto;

  try {
    singlePhoto = await getPhotoBySlugWithUser(slug);
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }

  if (!singlePhoto) {
    throw createError({
      statusCode: 404,
      message: "Photo not found",
    });
  }

  if (!singlePhoto.approved) {
    const session = await getOptionalKindeUser(event);
    const viewer = session ? await getLoggedInUser(session.id) : null;
    const canView =
      viewer &&
      (viewer.role === "admin" || viewer.id === singlePhoto.userId);

    if (!canView) {
      throw createError({
        statusCode: 404,
        message: "Photo not found",
      });
    }
  }

  return singlePhoto;
});
