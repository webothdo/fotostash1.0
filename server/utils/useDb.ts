import { db } from "../lib/drizzle";

/**
 * useDb composable for server-side DB access with Drizzle ORM
 * Usage: const db = useDb();
 */
export function useDb() {
  return db;
}
