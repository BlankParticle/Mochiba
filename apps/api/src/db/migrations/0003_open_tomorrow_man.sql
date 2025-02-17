CREATE TABLE `email_attachment` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email_id` integer NOT NULL,
	`file_id` text NOT NULL,
	`content_type` text NOT NULL,
	`inline` integer DEFAULT false NOT NULL
);
