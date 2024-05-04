import { eq } from "drizzle-orm";
import { photo } from "../database/schema";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  // return query.userId;

  try {
    const photos = db.query.photo.findMany({
      where: eq(photo.userId, query.userId),
    });

    return photos;
  } catch (error) {
    throw new Error(error?.message);
  }
});
