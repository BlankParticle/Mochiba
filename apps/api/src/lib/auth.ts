import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import type { HonoCtx } from "@api/types";
import * as schema from "@api/db/schema";
import { betterAuth } from "better-auth";
import type { Context } from "hono";

export const createAuth = (c: Context<HonoCtx>) =>
  betterAuth({
    appName: "Mochiba",
    database: drizzleAdapter(c.var.db, { provider: "sqlite", schema }),
    plugins: [username()],
    secondaryStorage: {
      get: (key) => c.env.KV.get(key),
      set: (key, value, ttl) => c.env.KV.put(key, value, { expirationTtl: ttl }),
      delete: (key) => c.env.KV.delete(key),
    },
    secret: c.env.BETTER_AUTH_SECRET,
    baseURL: c.env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
    },
    logger: {
      disabled: true,
    },
    trustedOrigins: ["*"],
  });

export type AuthHandler = ReturnType<typeof createAuth>;
