export const getUserWithPhotos = async (id: string) => {
  const currentUser = await useDb().query.users.findFirst({
    where: (user, { eq }) => eq(user.id, id),
    with: {
      photos: true,
    },
  });
  return currentUser;
};

export const getUserByUsernameWithPhotos = async (username: string) => {
  const currentUser = await useDb().query.users.findFirst({
    where: (user, { eq }) => eq(user.username, username),
    with: {
      photos: true,
    },
  });
  return currentUser;
};
