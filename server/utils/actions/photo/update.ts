import { eq } from "drizzle-orm";
import { photos } from "~~/server/db/schema";

export const updatePhoto = async (
  id: string,
  data: Partial<typeof photos.$inferInsert>
) => {
  const updatedPhoto = await useDb()
    .update(photos)
    .set(data)
    .where(eq(photos.id, id))
    .returning();
  return updatedPhoto;
};

export const approvePhoto = async (id: string) => {
  return await updatePhoto(id, {
    approved: true,
    rejected: false,
    updatedAt: new Date(),
  });
};

export const rejectPhoto = async (id: string) => {
  return await updatePhoto(id, {
    approved: false,
    rejected: true,
    updatedAt: new Date(),
  });
};
