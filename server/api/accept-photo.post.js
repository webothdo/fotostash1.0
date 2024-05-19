import { approvedPhoto } from "../database/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  try {
    await db.insert(approvedPhoto).values({
      id: body.id,
    });
  } catch (error) {}
});
