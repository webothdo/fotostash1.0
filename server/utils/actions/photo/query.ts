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

export const getPhotoBySlugWithUser = async (slug: string) => {
  const photo = await useDb().query.photos.findFirst({
    where: (photo, { eq }) => eq(photo.slug, slug),
    with: {
      user: {
        columns: {
          username: true,
          picture: true,
          name: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
  return photo;
};
