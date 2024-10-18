CREATE TABLE `images` (
	`id` text PRIMARY KEY NOT NULL,
	`original_filename` text,
	`filename` text,
	`type` text,
	`created` text DEFAULT (CURRENT_TIMESTAMP)
);
