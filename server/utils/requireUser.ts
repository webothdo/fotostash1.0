import type { H3Event } from "h3";
import { getLoggedInUser } from "~~/server/utils/actions/user/query";

export const requireUser = async (event: H3Event) => {
  const session = await getOptionalKindeUser(event);

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Please sign in to continue",
    });
  }

  const user = await getLoggedInUser(session.id);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Please sign in to continue",
    });
  }

  return user;
};
