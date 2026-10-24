export const getPublicUserProfileWithUsername = async (
  username: string,
  viewerId?: string | null
) => {
  const db = useDb();
  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.username, username),
    columns: {
      id: true,
      name: true,
      username: true,
      displayUsername: true,
      picture: true,
      bio: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    },
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

  const [userCollections, followCounts, viewerFollows] = await Promise.all([
    listPublicCollectionsForUser(user.id, viewerId),
    getFollowCounts(user.id),
    viewerId ? isFollowing(viewerId, user.id) : Promise.resolve(false),
  ]);

  return {
    ...user,
    photos,
    collections: userCollections,
    ...followCounts,
    isFollowing: viewerFollows,
    isOwner,
    approvedPhotoCount: photos.filter((photo) => photo.approved).length,
    pendingPhotoCount: photos.filter((photo) => !photo.approved && !photo.rejected)
      .length,
  };
};
