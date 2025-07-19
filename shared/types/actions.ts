/*
 * Derived helper types that model the richer result shapes returned by the
 * helper functions found in `server/utils/actions/*`.
 *
 * These utilities are **purely type-level** – importing this file does **not**
 * add any runtime code to the bundle.
 */
import type { User, Photo } from "./schema";

/* -------------------------------------------------------------------------- */
/*                                USER ACTIONS                               */
/* -------------------------------------------------------------------------- */

/**
 * A `User` together with all of their `Photo`s as returned by
 * `getUserWithPhotos` or `getUserByUsernameWithPhotos`.
 */
export type UserWithPhotos = User & {
  photos: Photo[];
};

/**
 * A light-weight representation of a user suitable for public lists – matches
 * the `user` relation picked inside `getAllPhotos`.
 */
export type BasicUser = Pick<User, "username" | "picture">;

/* -------------------------------------------------------------------------- */
/*                               PHOTO ACTIONS                               */
/* -------------------------------------------------------------------------- */

/**
 * A `Photo` together with a pared-down `user` relation that exposes only
 * `username` and `picture`. This matches the shape returned by
 * `getAllPhotos`.
 */
export type PhotoWithUserBasic = Photo & {
  user: BasicUser;
};

/**
 * Profile page public data – the logged-out visitor can see a user with their
 * photos but those photos do not expose the `userId` column.
 */
export type PublicUserProfile = User & {
  photos: Omit<Photo, "userId">[];
};
