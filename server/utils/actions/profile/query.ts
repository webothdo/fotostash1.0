export const getPublicUserProfileWithUsername = async (username: string) => {
  const publicUser = await useDb().query.users.findFirst({
    where: (user, { eq }) => eq(user.username, username),
    with: {
      photos: {
        columns: {
          userId: false,
        },
        orderBy: (photo, { desc }) => [desc(photo.createdAt)],
      },
    },
  });
  return publicUser;
};
