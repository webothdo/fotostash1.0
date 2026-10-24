import { getPopularTags } from "~~/server/utils/actions/photo/query";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const requestedLimit = Number(query.limit);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(60, Math.max(1, Math.trunc(requestedLimit)))
    : 24;

  try {
    setHeader(
      event,
      "cache-control",
      "public, max-age=300, stale-while-revalidate=900"
    );
    return await getPopularTags(limit);
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }
});
