import { and, asc, desc, eq, gt, lt, or, sql } from "drizzle-orm";
import { photos } from "~~/server/db/schema";
import { normalizeTag } from "~~/server/utils/tags";

export type PhotoSort = "latest" | "oldest";
export type PhotoOrientation = "landscape" | "portrait" | "square";

export interface PhotoPageOptions {
  limit?: number;
  cursor?: string;
  q?: string;
  tag?: string;
  orientation?: PhotoOrientation;
  sort?: PhotoSort;
}

const encodeCursor = (photo: { createdAt: Date | null; id: string }) => {
  if (!photo.createdAt) return null;
  return Buffer.from(`${photo.createdAt.toISOString()}|${photo.id}`).toString(
    "base64url"
  );
};

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

const normalizeSearchTerm = (value?: string) =>
  (value ?? "").trim().replace(/[%_]+/g, " ").slice(0, 120);

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

export const getApprovedPhotoPage = async ({
  limit = 24,
  cursor,
  q,
  tag,
  orientation,
  sort = "latest",
}: PhotoPageOptions = {}) => {
  const decodedCursor = cursor ? decodeCursor(cursor) : null;
  const ascending = sort === "oldest";
  const term = normalizeSearchTerm(q);
  const normalizedTag = tag ? normalizeTag(tag) : "";

  const conditions = [eq(photos.approved, true)];

  if (term) {
    const pattern = `%${term}%`;
    conditions.push(
      or(
        sql`lower(${photos.title}) like lower(${pattern})`,
        sql`lower(${photos.description}) like lower(${pattern})`,
        sql`lower(${photos.tags}) like lower(${pattern})`
      )!
    );
  }

  if (normalizedTag) {
    conditions.push(sql`lower(${photos.tags}) like ${`%"${normalizedTag}"%`}`);
  }

  if (orientation === "landscape") {
    conditions.push(sql`${photos.width} > ${photos.height}`);
  } else if (orientation === "portrait") {
    conditions.push(sql`${photos.width} < ${photos.height}`);
  } else if (orientation === "square") {
    conditions.push(
      sql`${photos.width} is not null and abs(${photos.width} - ${photos.height}) * 20 <= max(${photos.width}, ${photos.height})`
    );
  }

  if (decodedCursor) {
    conditions.push(
      or(
        ascending
          ? gt(photos.createdAt, decodedCursor.createdAt)
          : lt(photos.createdAt, decodedCursor.createdAt),
        and(
          eq(photos.createdAt, decodedCursor.createdAt),
          ascending
            ? gt(photos.id, decodedCursor.id)
            : lt(photos.id, decodedCursor.id)
        )
      )!
    );
  }

  const rows = await useDb().query.photos.findMany({
    where: and(...conditions),
    with: {
      user: {
        columns: {
          username: true,
          picture: true,
        },
      },
    },
    orderBy: ascending
      ? [asc(photos.createdAt), asc(photos.id)]
      : [desc(photos.createdAt), desc(photos.id)],
    limit: limit + 1,
  });

  const items = rows.slice(0, limit);

  return {
    items,
    nextCursor:
      rows.length > limit && items.length > 0
        ? encodeCursor(items[items.length - 1]!)
        : null,
  };
};

export const getRelatedPhotos = async (photo: {
  id: string;
  userId: string;
  tags?: string[] | null;
  limit?: number;
}) => {
  const tags = (photo.tags ?? []).slice(0, 6);

  if (tags.length === 0) {
    return await useDb().query.photos.findMany({
      where: (p, { and, eq, ne }) =>
        and(eq(p.approved, true), eq(p.userId, photo.userId), ne(p.id, photo.id)),
      with: { user: { columns: { username: true, picture: true } } },
      orderBy: (p, { desc }) => [desc(p.createdAt)],
      limit: photo.limit ?? 8,
    });
  }

  const tagConditions = tags.map(
    (tag) => sql`lower(${photos.tags}) like ${`%"${normalizeTag(tag)}"%`}`
  );

  const rows = await useDb().query.photos.findMany({
    where: (p, { and, eq, ne }) =>
      and(
        eq(p.approved, true),
        ne(p.id, photo.id),
        or(...tagConditions, eq(p.userId, photo.userId))!
      ),
    with: { user: { columns: { username: true, picture: true } } },
    orderBy: (p, { desc }) => [desc(p.createdAt)],
    limit: photo.limit ?? 8,
  });

  return rows.filter((row) => row.id !== photo.id);
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

export const getPopularTags = async (limit = 24) => {
  const rows = await useDb()
    .select({ tags: photos.tags })
    .from(photos)
    .where(eq(photos.approved, true))
    .limit(2000);

  const counts = new Map<string, number>();

  for (const row of rows) {
    const tags = Array.isArray(row.tags) ? row.tags : [];

    for (const value of tags) {
      if (typeof value !== "string") continue;
      const tag = normalizeTag(value);
      if (!tag) continue;
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit);
};
