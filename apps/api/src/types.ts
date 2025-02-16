import type { AuthHandler } from "./lib/auth";
import type { DrizzleDB } from "./db";

export type Variables = {
  db: DrizzleDB;
  auth: AuthHandler;
  user: AuthHandler["$Infer"]["Session"]["user"] | null;
  session: AuthHandler["$Infer"]["Session"]["session"] | null;
};

export type HonoCtx = { Bindings: CloudflareBindings; Variables: Variables };
