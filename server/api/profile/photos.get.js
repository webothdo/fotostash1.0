import { eq } from "drizzle-orm";
import { photo } from "~~/server/database/schema";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  //   return query;

  const photos = await db.query.photo.findMany({
    where: eq(photo.profileId, query.profileId),
  });

  if (!photos) {
    return null;
  }

  if (photos.length === 0) {
    return null;
  }

  return photos;
});
