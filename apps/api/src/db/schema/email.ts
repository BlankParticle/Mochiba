import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";

export const thread = sqliteTable("thread", {
  id: integer().primaryKey({ autoIncrement: true }),
  publicId: text()
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  ownerId: text().notNull(),
  subject: text().notNull(),
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const threadRelations = relations(thread, ({ many, one }) => ({
  emails: many(email),
  owner: one(user, {
    fields: [thread.ownerId],
    references: [user.id],
  }),
}));

export const email = sqliteTable("email", {
  id: integer().primaryKey({ autoIncrement: true }),
  messageId: text().notNull(),
  from: text().notNull(),
  to: text().notNull(),
  date: integer({ mode: "timestamp" }).notNull(),
  headers: text({ mode: "json" }).notNull().$type<Record<string, string>[]>(),
  envelope: text({ mode: "json" }).notNull().$type<{ from: string; to: string }>(),
  subject: text().notNull(),
  bodyHtml: text().notNull(),
  bodyText: text().notNull(),
  ownerId: text().notNull(),
  parentThreadId: integer().notNull(),
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const emailRelations = relations(email, ({ one }) => ({
  parentThread: one(thread, {
    fields: [email.parentThreadId],
    references: [thread.id],
  }),
  owner: one(user, {
    fields: [email.ownerId],
    references: [user.id],
  }),
}));

export const emailRules = sqliteTable("email_rules", {
  id: integer().primaryKey({ autoIncrement: true }),
  domain: text().notNull(),
  rule: text().notNull(),
  action: text({ enum: ["store", "forward", "drop"] }).notNull(),
  forwardTo: text(),
  storeTo: text(),
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
