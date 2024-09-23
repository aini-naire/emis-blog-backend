CREATE TABLE `nav` (
	`id` text,
	`language` text NOT NULL,
	`url` text,
	`text` text,
	`enabled` integer,
	`order` integer,
	PRIMARY KEY(`id`, `language`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text,
	`hidden` integer,
	`author_Id` text,
	`created` text DEFAULT (CURRENT_TIMESTAMP),
	`modified` text DEFAULT (CURRENT_TIMESTAMP),
	`language` text NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`tagline` text NOT NULL,
	`content` text NOT NULL,
	`showAuthor` integer,
	`page` integer,
	`private` integer,
	PRIMARY KEY(`id`, `language`),
	FOREIGN KEY (`author_Id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `post_tags` (
	`post_id` text,
	`tag_id` text,
	`language` text,
	FOREIGN KEY (`post_id`, `language`) REFERENCES `posts`(`id`, `language`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`, `language`) REFERENCES `tags`(`id`, `language`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text,
	`language` text NOT NULL,
	`title` text NOT NULL,
	`tagline` text NOT NULL,
	`url` text NOT NULL,
	PRIMARY KEY(`id`, `language`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text,
	`password` text,
	`email` text,
	`full_name` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_url_unique` ON `posts` (`url`);--> statement-breakpoint
CREATE UNIQUE INDEX `tags_url_unique` ON `tags` (`url`);