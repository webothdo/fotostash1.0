/**
 * Canonical origin for links, sitemaps and social metadata.
 * Uses NUXT_PUBLIC_SITE_URL when configured, otherwise the origin of the
 * current request so previews and self-hosted deployments stay correct.
 */
export const useSiteUrl = () => {
  const config = useRuntimeConfig();
  const requestUrl = useRequestURL();
  const configured = String(config.public.siteUrl || "").replace(/\/+$/, "");

  if (configured) return configured;

  const origin = requestUrl.origin.replace(/\/+$/, "");
  const host = requestUrl.hostname;
  const isLocal =
    host === "localhost" || host === "127.0.0.1" || host === "[::1]";

  // Proxies terminate TLS before Nuxt sees the request; canonical URLs must
  // still point at the public HTTPS origin.
  return isLocal ? origin : origin.replace(/^http:/, "https:");
};
