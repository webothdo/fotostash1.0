import { eq } from "drizzle-orm";
import { profile } from "../database/schema";

export default async function getUser(id) {
  const user = db.query.profile.findFirst({
    where: eq(profile.userId, id),
  });

  if (!user) {
    return null;
  }
  return user;
}
