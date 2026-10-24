import { useDb } from "../useDb";

export const isUsernameAvailable = async (
  username: string,
  excludeUserId?: string
) => {
  const existingUser = await useDb().query.users.findFirst({
    where: (user, { eq }) => eq(user.username, username),
    columns: { id: true },
  });

  if (!existingUser) {
    return true;
  }

  // A user may keep their current username.
  return existingUser.id === excludeUserId;
};
