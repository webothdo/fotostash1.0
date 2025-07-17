export const getUser = async (id: string) => {
  const currentUser = await useDb().query.user.findFirst({
    where: (user, { eq }) => eq(user.id, id),
  });
  return currentUser;
};

export const getUserByUsername = async (username: string) => {
  const currentUser = await useDb().query.user.findFirst({
    where: (user, { eq }) => eq(user.username, username),
  });
  return currentUser;
};
