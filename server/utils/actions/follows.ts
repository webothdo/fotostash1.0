import { count, eq } from "drizzle-orm";
import { follows } from "~~/server/db/schema";

export const getFollowCounts = async (userId: string) => {
  const [followers] = await useDb()
    .select({ total: count() })
    .from(follows)
    .where(eq(follows.followingId, userId));
  const [following] = await useDb()
    .select({ total: count() })
    .from(follows)
    .where(eq(follows.followerId, userId));

  return {
    followerCount: Number(followers?.total ?? 0),
    followingCount: Number(following?.total ?? 0),
  };
};

export const isFollowing = async (followerId: string, followingId: string) => {
  const row = await useDb().query.follows.findFirst({
    where: (follow, { and, eq }) =>
      and(
        eq(follow.followerId, followerId),
        eq(follow.followingId, followingId)
      ),
    columns: { id: true },
  });

  return Boolean(row);
};

export const toggleFollow = async (followerId: string, followingId: string) => {
  if (followerId === followingId) {
    throw createError({
      statusCode: 400,
      message: "You cannot follow yourself",
    });
  }

  const db = useDb();
  const existing = await db.query.follows.findFirst({
    where: (follow, { and, eq }) =>
      and(
        eq(follow.followerId, followerId),
        eq(follow.followingId, followingId)
      ),
    columns: { id: true },
  });

  if (existing) {
    await db.delete(follows).where(eq(follows.id, existing.id));
  } else {
    await db
      .insert(follows)
      .values({ followerId, followingId })
      .onConflictDoNothing();
  }

  return {
    following: !existing,
    ...(await getFollowCounts(followingId)),
  };
};

export const getFollowingIds = async (userId: string) => {
  const rows = await useDb()
    .select({ id: follows.followingId })
    .from(follows)
    .where(eq(follows.followerId, userId));

  return rows.map((row) => row.id);
};

export const getFollowerIds = async (userId: string) => {
  const rows = await useDb()
    .select({ id: follows.followerId })
    .from(follows)
    .where(eq(follows.followingId, userId));

  return rows.map((row) => row.id);
};
