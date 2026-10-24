import { getLoggedInUser } from "~~/server/utils/actions/user/query";
import { getOptionalKindeUser } from "~~/server/utils/getOptionalKindeUser";

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username");

  if (!username) {
    throw createError({
      statusCode: 400,
      message: "Please provide a valid value",
    });
  }

  const cleanedUsername = username.startsWith("@")
    ? username.slice(1)
    : username;

  const session = await getOptionalKindeUser(event);
  const viewer = session ? await getLoggedInUser(session.id) : null;

  let publicUser;

  try {
    publicUser = await getPublicUserProfileWithUsername(
      cleanedUsername,
      viewer?.id
    );
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }

  if (!publicUser) {
    throw createError({
      statusCode: 404,
      message: "User not found",
    });
  }

  return publicUser;
});
