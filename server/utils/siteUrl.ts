import type { H3Event } from "h3";

export const getSiteUrl = (event: H3Event) => {
  const config = useRuntimeConfig(event);
  const configured = String(config.public.siteUrl || "").replace(/\/+$/, "");

  if (configured) return configured;

  const url = getRequestURL(event);
  const isLocal =
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "[::1]";
  const origin = url.origin.replace(/\/+$/, "");

  return isLocal ? origin : origin.replace(/^http:/, "https:");
};
