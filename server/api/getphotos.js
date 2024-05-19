import { eq } from "drizzle-orm";
import { photo } from "./database/schema";

export default defineEventHandler(async (event) => {
  // return "okay";
  try {
    const photos = await db.query.photo.findMany();

    return photos;
  } catch (error) {
    throw new Error(error?.message);
  }
});
