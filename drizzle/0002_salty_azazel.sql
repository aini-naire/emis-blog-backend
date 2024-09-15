CREATE TABLE `nav` (
	`id` text PRIMARY KEY NOT NULL,
	`language` text NOT NULL,
	`url` text,
	`text` text,
	`enabled` integer,
	`order` integer
);
--> statement-breakpoint
ALTER TABLE `posts` ADD `page` integer;--> statement-breakpoint
ALTER TABLE `posts` ADD `private` integer;