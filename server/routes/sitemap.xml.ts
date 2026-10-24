import { eq, isNotNull } from "drizzle-orm";
import { collections, photos, users } from "~~/server/db/schema";
import { getPopularTags } from "~~/server/utils/actions/photo/query";

const escapeXml = (value: string) =>
  value.replace(
    /[<>&'"]/g,
    (character) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[character] ?? character
  );

export default defineEventHandler(async (event) => {
  const baseUrl = getSiteUrl(event);

  const [photoRows, userRows, tagRows, collectionRows] = await Promise.all([
    useDb()
      .select({ slug: photos.slug, updatedAt: photos.updatedAt })
      .from(photos)
      .where(eq(photos.approved, true)),
    useDb()
      .select({ username: users.username, updatedAt: users.updatedAt })
      .from(users)
      .where(isNotNull(users.username)),
    getPopularTags(100),
    useDb()
      .select({ id: collections.id, updatedAt: collections.updatedAt })
      .from(collections)
      .where(eq(collections.isPrivate, false)),
  ]);

  const urls = [
    { loc: baseUrl, lastmod: undefined },
    ...photoRows
      .filter((photo) => photo.slug)
      .map((photo) => ({
        loc: `${baseUrl}/photo/${encodeURIComponent(photo.slug!)}`,
        lastmod: photo.updatedAt?.toISOString().slice(0, 10),
      })),
    ...userRows
      .filter((user) => user.username)
      .map((user) => ({
        loc: `${baseUrl}/@${encodeURIComponent(user.username!)}`,
        lastmod: user.updatedAt?.toISOString().slice(0, 10),
      })),
    ...tagRows.map(({ tag }) => ({
      loc: `${baseUrl}/tag/${encodeURIComponent(tag)}`,
      lastmod: undefined,
    })),
    ...collectionRows.map((collection) => ({
      loc: `${baseUrl}/collections/${encodeURIComponent(collection.id)}`,
      lastmod: collection.updatedAt?.toISOString().slice(0, 10),
    })),
  ];

  setHeader(event, "content-type", "application/xml; charset=utf-8");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) =>
      `  <url><loc>${escapeXml(url.loc)}</loc>${
        url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ""
      }</url>`
  )
  .join("\n")}
</urlset>`;
});
