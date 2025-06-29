import { and, eq } from "drizzle-orm";
import { photo } from "~~/server/database/schema";

//returns all photos that needs approval

export default defineEventHandler(async (event) => {
  const accessToken = getRequestHeader(event, "Authorization");
  const query = getQuery(event);

  if (query.type === "needsApproval") {
    //find all photos that needs approval
    const photos = await db.query.photo.findMany({
      where: and(eq(photo.approved, false), eq(photo.rejected, false)),
    });
    return photos;
  }

  if (query.type === "isRejected") {
    //find all rejected photos
  }

  if (query.type === "isApproved") {
    //find all approved photos
  }
});
