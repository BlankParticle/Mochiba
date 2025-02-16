CREATE TABLE `email` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`message_id` text NOT NULL,
	`from` text NOT NULL,
	`to` text NOT NULL,
	`date` integer NOT NULL,
	`headers` text NOT NULL,
	`envelope` text NOT NULL,
	`subject` text NOT NULL,
	`body_html` text NOT NULL,
	`body_text` text NOT NULL,
	`owner_id` text NOT NULL,
	`parent_thread_id` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `thread` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`subject` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
