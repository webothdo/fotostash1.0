import type { H3Event } from "h3";

export const getOptionalKindeUser = async (event: H3Event) => {
  try {
    if (!(await event.context.kinde.isAuthenticated())) {
      return null;
    }

    return await event.context.kinde.getUserProfile();
  } catch {
    return null;
  }
};
