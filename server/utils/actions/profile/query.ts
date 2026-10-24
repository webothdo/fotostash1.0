export const getPublicUserProfileWithUsername = async (
  username: string,
  viewerId?: string | null
) => {
  const db = useDb();
  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.username, username),
  });

  if (!user) return null;

  const isOwner = Boolean(viewerId && viewerId === user.id);

  const photos = await db.query.photos.findMany({
    where: (photo, { and, eq }) =>
      isOwner
        ? eq(photo.userId, user.id)
        : and(eq(photo.userId, user.id), eq(photo.approved, true)),
    columns: {
      userId: false,
    },
    orderBy: (photo, { desc }) => [desc(photo.createdAt)],
  });

  const userCollections = await listPublicCollectionsForUser(user.id, viewerId);

  return {
    ...user,
    photos,
    collections: userCollections,
    isOwner,
    approvedPhotoCount: photos.filter((photo) => photo.approved).length,
    pendingPhotoCount: photos.filter((photo) => !photo.approved && !photo.rejected)
      .length,
  };
};
