import { eq, sql } from "drizzle-orm";
import { photos } from "~~/server/db/schema";
import { getLoggedInUser } from "~~/server/utils/actions/user/query";
import { getOptionalKindeUser } from "~~/server/utils/getOptionalKindeUser";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({ statusCode: 400, message: "Photo ID is required" });
  }

  const db = useDb();
  const photo = await db.query.photos.findFirst({
    where: (photo, { eq }) => eq(photo.id, id),
    columns: { id: true, url: true, approved: true, userId: true },
  });

  if (!photo) {
    throw createError({ statusCode: 404, message: "Photo not found" });
  }

  if (!photo.approved) {
    const session = await getOptionalKindeUser(event);
    const viewer = session ? await getLoggedInUser(session.id) : null;
    const canView =
      viewer && (viewer.role === "admin" || viewer.id === photo.userId);

    if (!canView) {
      throw createError({ statusCode: 404, message: "Photo not found" });
    }
  }

  try {
    const [updated] = await db
      .update(photos)
      .set({ downloads: sql`${photos.downloads} + 1` })
      .where(eq(photos.id, photo.id))
      .returning({ downloads: photos.downloads });

    setHeader(event, "cache-control", "no-store");

    return {
      url: photo.url,
      downloads: updated?.downloads ?? 1,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }
});
