import type { attachmentStorage } from "./utils/attachment-storage";
import type { AuthHandler } from "./lib/auth";
import type { DrizzleDB } from "./db";

export type Variables = {
  db: DrizzleDB;
  auth: AuthHandler;
  storage: ReturnType<typeof attachmentStorage>;
  user: AuthHandler["$Infer"]["Session"]["user"] | null;
  session: AuthHandler["$Infer"]["Session"]["session"] | null;
};

export type HonoCtx = { Bindings: CloudflareBindings; Variables: Variables };
