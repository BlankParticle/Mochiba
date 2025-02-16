CREATE TABLE `email_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`domain` text NOT NULL,
	`rule` text NOT NULL,
	`action` text NOT NULL,
	`forward_to` text,
	`store_to` text,
	`created_at` integer NOT NULL
);
