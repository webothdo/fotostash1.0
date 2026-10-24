import { rejectPhoto } from "~~/server/utils/actions/photo/update";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  if (user.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  const { id } = event.context.params as { id: string };

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Photo ID is required",
    });
  }

  try {
    const rejectedPhoto = await rejectPhoto(id);

    return {
      success: true,
      photo: rejectedPhoto[0],
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }
});
