import {
  getApprovedPhotoPage,
  type PhotoOrientation,
  type PhotoSort,
} from "~~/server/utils/actions/photo/query";

const ORIENTATIONS: PhotoOrientation[] = ["landscape", "portrait", "square"];

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const requestedLimit = Number(query.limit);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(48, Math.max(1, Math.trunc(requestedLimit)))
    : 24;
  const cursor =
    typeof query.cursor === "string" && query.cursor.length > 0
      ? query.cursor
      : undefined;
  const q = typeof query.q === "string" ? query.q.slice(0, 120) : undefined;
  const tag = typeof query.tag === "string" ? query.tag.slice(0, 64) : undefined;
  const orientation = ORIENTATIONS.includes(query.orientation as PhotoOrientation)
    ? (query.orientation as PhotoOrientation)
    : undefined;
  const sort: PhotoSort = query.sort === "oldest" ? "oldest" : "latest";

  try {
    setHeader(
      event,
      "cache-control",
      "public, max-age=30, stale-while-revalidate=300"
    );

    return await getApprovedPhotoPage({
      limit,
      cursor,
      q,
      tag,
      orientation,
      sort,
    });
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }
});
