export const getAllPhotos = async () => {
  const photo = await useDb().query.photos.findMany({
    with: {
      user: {
        columns: {
          username: true,
          picture: true,
        },
      },
    },
    orderBy: (photo, { desc }) => [desc(photo.createdAt)],
  });
  return photo;
};
