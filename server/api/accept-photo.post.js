import { approvedPhoto } from "../database/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return body;
  try {
    await db.insert(approvedPhoto).values({
      id: body.id,
    });
  } catch (error) {
    return error;
  }
});
