CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`url` text NOT NULL,
	`approved` integer DEFAULT false,
	`rejected` integer DEFAULT false,
	`featured` integer DEFAULT false,
	`user_id` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text,
	`email` text,
	`username` text,
	`display_username` text,
	`role` text DEFAULT 'user' NOT NULL,
	`first_name` text,
	`last_name` text,
	`bio` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);