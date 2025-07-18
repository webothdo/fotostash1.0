export const getUserWithPhotos = async (id: string) => {
  const currentUser = await useDb().query.users.findFirst({
    where: (user, { eq }) => eq(user.kindeId, id),
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

export const getLoggedInUser = async (id: string) => {
  const currentUser = await useDb().query.users.findFirst({
    where: (user, { eq }) => eq(user.kindeId, id),
  });
  return currentUser;
};

export const getLoggedInUserPhotos = async (id: string) => {
  const currentUserPhotos = await useDb().query.photos.findMany({
    where: (photo, { eq }) => eq(photo.userId, id),
    orderBy: (photo, { desc }) => [desc(photo.createdAt)],
  });
  return currentUserPhotos;
};
