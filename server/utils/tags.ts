export const MAX_TAGS_PER_PHOTO = 8;
export const MAX_TAG_LENGTH = 32;

export function normalizeTag(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^#+/, "")
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}_-]+/gu, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_TAG_LENGTH);
}

export function parseTags(value: unknown): string[] {
  let raw: unknown[] = [];

  if (Array.isArray(value)) {
    raw = value;
  } else if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      raw = Array.isArray(parsed) ? parsed : value.split(",");
    } catch {
      raw = value.split(",");
    }
  }

  const tags = raw
    .filter((tag): tag is string => typeof tag === "string")
    .map(normalizeTag)
    .filter(Boolean);

  return [...new Set(tags)].slice(0, MAX_TAGS_PER_PHOTO);
}
