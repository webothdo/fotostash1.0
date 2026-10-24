import { and, desc, eq } from "drizzle-orm";
import { collectionPhotos, collections } from "~~/server/db/schema";

const collectionPhotoInclude = {
  with: {
    photo: {
      columns: {
        id: true,
        slug: true,
        url: true,
        title: true,
        width: true,
        height: true,
        approved: true,
      },
      with: {
        user: { columns: { username: true, picture: true } },
      },
    },
  },
  orderBy: (link: any, { desc }: any) => [desc(link.addedAt)],
};

export const createCollection = async (
  userId: string,
  data: { name: string; description?: string | null; isPrivate?: boolean }
) => {
  const [collection] = await useDb()
    .insert(collections)
    .values({
      userId,
      name: data.name,
      description: data.description ?? null,
      isPrivate: data.isPrivate ?? true,
    })
    .returning();

  return collection;
};

export const listOwnCollections = async (userId: string, photoId?: string) => {
  const rows = await useDb().query.collections.findMany({
    where: (collection, { eq }) => eq(collection.userId, userId),
    with: {
      photos: photoId
        ? {
            where: (link, { eq }) => eq(link.photoId, photoId),
            columns: { id: true, photoId: true, addedAt: true },
          }
        : {
            columns: { id: true, photoId: true, addedAt: true },
            with: {
              photo: {
                columns: {
                  id: true,
                  slug: true,
                  url: true,
                  title: true,
                  width: true,
                  height: true,
                },
              },
            },
            orderBy: (link, { desc }) => [desc(link.addedAt)],
            limit: 4,
          },
    },
    orderBy: (collection, { desc }) => [desc(collection.updatedAt)],
  });

  return rows.map((collection) => ({
    ...collection,
    photoCount: collection.photos.length,
    contains: photoId ? collection.photos.length > 0 : undefined,
    previewPhotos: photoId
      ? []
      : collection.photos.flatMap((link) =>
          "photo" in link && link.photo ? [link.photo] : []
        ),
  }));
};

export const getCollectionById = async (
  id: string,
  viewerId?: string | null
) => {
  const collection = await useDb().query.collections.findFirst({
    where: (collection, { eq }) => eq(collection.id, id),
    with: {
      user: {
        columns: { username: true, picture: true, name: true },
      },
      photos: collectionPhotoInclude,
    },
  });

  if (!collection) return null;

  const isOwner = Boolean(viewerId && viewerId === collection.userId);

  if (collection.isPrivate && !isOwner) return null;

  const photos = collection.photos
    .map((link) => link.photo)
    .filter((photo) => Boolean(photo))
    .filter((photo) => isOwner || Boolean((photo as { approved?: boolean }).approved));

  return {
    ...collection,
    isOwner,
    photos,
  };
};

export const updateCollection = async (
  id: string,
  userId: string,
  data: { name?: string; description?: string | null; isPrivate?: boolean }
) => {
  const [updated] = await useDb()
    .update(collections)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(collections.id, id), eq(collections.userId, userId)))
    .returning();

  return updated ?? null;
};

export const deleteCollection = async (id: string, userId: string) => {
  const [deleted] = await useDb()
    .delete(collections)
    .where(and(eq(collections.id, id), eq(collections.userId, userId)))
    .returning({ id: collections.id });

  return Boolean(deleted);
};

export const addPhotoToCollection = async (
  id: string,
  userId: string,
  photoId: string
) => {
  const db = useDb();
  const collection = await db.query.collections.findFirst({
    where: (collection, { and, eq }) =>
      and(eq(collection.id, id), eq(collection.userId, userId)),
    columns: { id: true },
  });

  if (!collection) return false;

  const photo = await db.query.photos.findFirst({
    where: (photo, { and, eq }) =>
      and(eq(photo.id, photoId), eq(photo.approved, true)),
    columns: { id: true },
  });

  if (!photo) return false;

  await db
    .insert(collectionPhotos)
    .values({ collectionId: id, photoId })
    .onConflictDoNothing();

  await db
    .update(collections)
    .set({ updatedAt: new Date() })
    .where(eq(collections.id, id));

  return true;
};

export const removePhotoFromCollection = async (
  id: string,
  userId: string,
  photoId: string
) => {
  const db = useDb();
  const collection = await db.query.collections.findFirst({
    where: (collection, { and, eq }) =>
      and(eq(collection.id, id), eq(collection.userId, userId)),
    columns: { id: true },
  });

  if (!collection) return false;

  await db
    .delete(collectionPhotos)
    .where(
      and(
        eq(collectionPhotos.collectionId, id),
        eq(collectionPhotos.photoId, photoId)
      )
    );

  await db
    .update(collections)
    .set({ updatedAt: new Date() })
    .where(eq(collections.id, id));

  return true;
};

export const getCollectionsForPhoto = async (
  userId: string,
  photoId: string
) => {
  const rows = await useDb().query.collections.findMany({
    where: (collection, { eq }) => eq(collection.userId, userId),
    with: {
      photos: {
        where: (link, { eq }) => eq(link.photoId, photoId),
        columns: { id: true },
      },
    },
    orderBy: (collection, { desc }) => [desc(collection.updatedAt)],
  });

  return rows.map((collection) => ({
    id: collection.id,
    name: collection.name,
    isPrivate: collection.isPrivate,
    contains: collection.photos.length > 0,
  }));
};

export const listPublicCollectionsForUser = async (
  userId: string,
  viewerId?: string | null
) => {
  const isOwner = Boolean(viewerId && viewerId === userId);

  const rows = await useDb().query.collections.findMany({
    where: (collection, { and, eq }) =>
      isOwner
        ? eq(collection.userId, userId)
        : and(eq(collection.userId, userId), eq(collection.isPrivate, false)),
    with: {
      photos: {
        columns: { id: true },
        with: {
          photo: {
            columns: {
              id: true,
              slug: true,
              url: true,
              title: true,
              width: true,
              height: true,
            },
          },
        },
        orderBy: (link, { desc }) => [desc(link.addedAt)],
      },
    },
    orderBy: (collection, { desc }) => [desc(collection.updatedAt)],
  });

  return rows.map((collection) => ({
    ...collection,
    photoCount: collection.photos.length,
    previewPhotos: collection.photos
      .flatMap((link) => ("photo" in link && link.photo ? [link.photo] : []))
      .slice(0, 4),
  }));
};
