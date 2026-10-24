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
const { getImageExif } = await import("../utils/imageExif");

const rows = await db
  .select({ id: photos.id, url: photos.url, exif: photos.exif })
  .from(photos);

const queue = [...rows];
let updated = 0;
let unchanged = 0;
let failed = 0;

console.log(`Checking ${rows.length} photo(s) with concurrency ${CONCURRENCY}...`);

async function processPhoto(photo: (typeof rows)[number]) {
  try {
    const response = await fetch(photo.url, {
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      throw new Error(`Failed to download image (${response.status})`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const exif = await getImageExif(buffer);
    const previous = photo.exif ? JSON.stringify(photo.exif) : null;
    const next = exif ? JSON.stringify(exif) : null;

    if (previous === next) {
      unchanged += 1;
      return;
    }

    await db.update(photos).set({ exif }).where(eq(photos.id, photo.id));
    updated += 1;
    console.log(`[update] ${photo.id}: ${exif ? "EXIF stored" : "no EXIF"}`);
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
