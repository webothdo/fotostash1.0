CREATE TABLE `collection_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`collection_id` text NOT NULL,
	`photo_id` text NOT NULL,
	`added_at` integer NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`photo_id`) REFERENCES `photos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `collection_photos_unique` ON `collection_photos` (`collection_id`,`photo_id`);--> statement-breakpoint
CREATE INDEX `collection_photos_photo_idx` ON `collection_photos` (`photo_id`);--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_private` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `collections_user_idx` ON `collections` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `likes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`photo_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`photo_id`) REFERENCES `photos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `likes_user_photo_unique` ON `likes` (`user_id`,`photo_id`);--> statement-breakpoint
CREATE INDEX `likes_photo_idx` ON `likes` (`photo_id`);--> statement-breakpoint
CREATE INDEX `likes_user_created_idx` ON `likes` (`user_id`,`created_at`);