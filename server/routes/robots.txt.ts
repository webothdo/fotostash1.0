export default defineEventHandler((event) => {
  const baseUrl = getSiteUrl(event);

  setHeader(event, "content-type", "text/plain; charset=utf-8");

  return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /profile
Disallow: /upload

Sitemap: ${baseUrl}/sitemap.xml
`;
});
