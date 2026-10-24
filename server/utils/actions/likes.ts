import { and, count, desc, eq, lt, or } from "drizzle-orm";
import { likes, photos } from "~~/server/db/schema";

export const countPhotoLikes = async (photoId: string) => {
  const [row] = await useDb()
    .select({ total: count() })
    .from(likes)
    .where(eq(likes.photoId, photoId));

  return Number(row?.total ?? 0);
};

export const isPhotoLiked = async (userId: string, photoId: string) => {
  const like = await useDb().query.likes.findFirst({
    where: (like, { and, eq }) =>
      and(eq(like.userId, userId), eq(like.photoId, photoId)),
    columns: { id: true },
  });

  return Boolean(like);
};

export const togglePhotoLike = async (userId: string, photoId: string) => {
  const db = useDb();
  const existing = await db.query.likes.findFirst({
    where: (like, { and, eq }) =>
      and(eq(like.userId, userId), eq(like.photoId, photoId)),
    columns: { id: true },
  });

  if (existing) {
    await db.delete(likes).where(eq(likes.id, existing.id));
  } else {
    try {
      await db.insert(likes).values({ userId, photoId });
    } catch {
      // Another request may have inserted the same like first; treat as liked.
    }
  }

  return {
    liked: !existing,
    likeCount: await countPhotoLikes(photoId),
  };
};

const encodeCursor = (row: { createdAt: Date; id: string }) =>
  Buffer.from(`${row.createdAt.toISOString()}|${row.id}`).toString("base64url");

const decodeCursor = (cursor: string) => {
  try {
    const [createdAt, id] = Buffer.from(cursor, "base64url")
      .toString()
      .split("|");
    if (!createdAt || !id) return null;
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return null;
    return { createdAt: date, id };
  } catch {
    return null;
  }
};

export const getLikedPhotoPage = async (
  userId: string,
  { limit = 24, cursor }: { limit?: number; cursor?: string } = {}
) => {
  const decoded = cursor ? decodeCursor(cursor) : null;
  const db = useDb();

  const conditions = [
    eq(likes.userId, userId),
    eq(photos.approved, true),
  ];

  if (decoded) {
    conditions.push(
      or(
        lt(likes.createdAt, decoded.createdAt),
        and(
          eq(likes.createdAt, decoded.createdAt),
          lt(likes.id, decoded.id)
        )
      )!
    );
  }

  const rows = await db
    .select({
      likeId: likes.id,
      likeCreatedAt: likes.createdAt,
      photoId: likes.photoId,
    })
    .from(likes)
    .innerJoin(photos, eq(likes.photoId, photos.id))
    .where(and(...conditions))
    .orderBy(desc(likes.createdAt), desc(likes.id))
    .limit(limit + 1);

  const pageRows = rows.slice(0, limit);
  const ids = pageRows.map((row) => row.photoId);

  const photoRows = ids.length
    ? await db.query.photos.findMany({
        where: (photo, { inArray }) => inArray(photo.id, ids),
        with: {
          user: { columns: { username: true, picture: true } },
        },
      })
    : [];

  const byId = new Map(photoRows.map((photo) => [photo.id, photo]));
  const items = pageRows
    .map((row) => byId.get(row.photoId))
    .filter((photo): photo is NonNullable<typeof photo> => Boolean(photo));

  const last = pageRows[pageRows.length - 1];

  return {
    items,
    nextCursor:
      rows.length > limit && last
        ? encodeCursor({ createdAt: last.likeCreatedAt, id: last.likeId })
        : null,
  };
};
