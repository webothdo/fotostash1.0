import process from "node:process";

const CONCURRENCY = Math.max(
  1,
  Number.parseInt(process.env.BACKFILL_CONCURRENCY ?? "4", 10) || 4
);

if (!process.env.TURSO_DATABASE_URL) {
  console.error("TURSO_DATABASE_URL is required.");
  process.exit(1);
}

const { eq } = await import("drizzle-orm");
const { db } = await import("../lib/drizzle");
const { photos } = await import("../db/schema");
const { getImageDimensionsFromUrl } = await import(
  "../utils/imageDimensions"
);

const rows = await db
  .select({
    id: photos.id,
    url: photos.url,
    width: photos.width,
    height: photos.height,
  })
  .from(photos);

const queue = [...rows];
let updated = 0;
let unchanged = 0;
let failed = 0;

console.log(`Checking ${rows.length} photo(s) with concurrency ${CONCURRENCY}...`);

async function processPhoto(photo: (typeof rows)[number]) {
  try {
    const dimensions = await getImageDimensionsFromUrl(photo.url);

    if (!dimensions) {
      failed += 1;
      console.warn(`[skip] ${photo.id}: unsupported or unreadable image`);
      return;
    }

    if (
      dimensions.width === photo.width &&
      dimensions.height === photo.height
    ) {
      unchanged += 1;
      return;
    }

    await db
      .update(photos)
      .set({ width: dimensions.width, height: dimensions.height })
      .where(eq(photos.id, photo.id));

    updated += 1;
    console.log(
      `[update] ${photo.id}: ${photo.width ?? "null"}x${photo.height ?? "null"} -> ${dimensions.width}x${dimensions.height}`
    );
  } catch (error) {
    failed += 1;
    console.error(`[fail] ${photo.id}: ${(error as Error).message}`);
  }
}

async function worker() {
  while (queue.length > 0) {
    const photo = queue.shift();
    if (photo) await processPhoto(photo);
  }
}

await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, Math.max(rows.length, 1)) }, () =>
    worker()
  )
);

console.log(
  `Done. ${updated} updated, ${unchanged} unchanged, ${failed} failed.`
);

if (failed > 0) {
  process.exitCode = 1;
}
