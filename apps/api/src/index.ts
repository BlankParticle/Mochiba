import { trimTrailingSlash } from "hono/trailing-slash";
import { emailHandler } from "./handlers/email";
import { trpcServer } from "@hono/trpc-server";
import type { TrpcContext } from "./trpc/trpc";
import { createAuth } from "./lib/auth";
import type { HonoCtx } from "./types";
import { logger } from "hono/logger";
import { createDrizzle } from "./db";
import type { Context } from "hono";
import { appRouter } from "./trpc";
import { Hono } from "hono/tiny";

const api = new Hono<HonoCtx>();
api.use(trimTrailingSlash());
api.use(logger());

// Debug hooks, auto injects during dev and treeshake out while deploying
declare const DEBUG: boolean;
DEBUG && (await import("./utils/debug")).hook(api);

api.use(async (c, next) => {
  const db = createDrizzle(c.env.DB);
  c.set("db", db);
  const auth = createAuth(c);
  c.set("auth", auth);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", session?.user ?? null);
  c.set("session", session?.session ?? null);
  await next();
});

api.on(["GET", "POST"], "/auth/*", (c) => c.var.auth.handler(c.req.raw));
api.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    endpoint: "/api/trpc",
    createContext: (_, c: Context<HonoCtx>) => ({ c, env: c.env, ...c.var }) satisfies TrpcContext,
  }),
);
api.all("*", (c) => c.json({ error: "Not Found" }, 404));

const app = new Hono<HonoCtx>().route("/api", api).get("*", (c) => c.env.ASSETS.fetch(c.req.url));

export default {
  fetch: app.fetch,
  email: emailHandler,
} satisfies ExportedHandler<CloudflareBindings>;
