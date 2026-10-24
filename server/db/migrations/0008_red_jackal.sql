ALTER TABLE `photos` ADD `description` text;--> statement-breakpoint
CREATE INDEX `photos_approved_created_idx` ON `photos` (`approved`,`created_at`);--> statement-breakpoint
CREATE INDEX `photos_user_created_idx` ON `photos` (`user_id`,`created_at`);