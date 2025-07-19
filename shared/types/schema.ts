import { users, photos } from "~~/server/db/schema";

/**
 * Base types inferred directly from the Drizzle schema.
 *
 *  - `User`  – full row selected from the `users` table
 *  - `NewUser` – shape required when inserting a new `users` row
 *  - `Photo` – full row selected from the `photos` table
 *  - `NewPhoto` – shape required when inserting a new `photos` row
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;
