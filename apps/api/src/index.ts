import { attachmentStorage } from "./utils/attachment-storage";
import { trimTrailingSlash } from "hono/trailing-slash";
import { vValidator } from "@hono/valibot-validator";
import { emailHandler } from "./handlers/email";
import { trpcServer } from "@hono/trpc-server";
import type { TrpcContext } from "./trpc/trpc";
import { emailAttachment } from "./db/schema";
import { createAuth } from "./lib/auth";
import type { HonoCtx } from "./types";
import { and, eq } from "drizzle-orm";
import { logger } from "hono/logger";
import { createDrizzle } from "./db";
import type { Context } from "hono";
import { proxy } from "hono/proxy";
import { appRouter } from "./trpc";
import { Hono } from "hono/tiny";
import * as v from "valibot";

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
  const storage = attachmentStorage(c.env);
  c.set("storage", storage);
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
api.get(
  "/attachment/:emailId/:fileId",
  vValidator(
    "param",
    v.object({ emailId: v.pipe(v.string(), v.transform(Number), v.number()), fileId: v.string() }),
  ),
  async (c) => {
    if (!c.var.user) return c.json({ error: "Unauthorized" }, 401);
    const { emailId, fileId } = c.req.valid("param");
    const foundAttachment = await c.var.db.query.emailAttachment.findFirst({
      where: and(eq(emailAttachment.emailId, emailId), eq(emailAttachment.fileId, fileId)),
      columns: {
        id: true,
        contentType: true,
      },
      with: {
        email: {
          columns: {
            ownerId: true,
          },
        },
      },
    });
    if (!foundAttachment || foundAttachment.email.ownerId !== c.var.user.id)
      return c.json({ error: "Not Found" }, 404);
    const attachment = await c.var.storage.get({ emailId, fileId });
    if (!attachment) return c.json({ error: "Not Found" }, 404);
    c.header("Content-Type", foundAttachment.contentType);
    c.header("Cache-Control", "private, max-age=86400");
    return c.body(attachment);
  },
);

api.get(
  "/attachment-proxy/:url",
  vValidator(
    "param",
    v.object({
      url: v.pipe(
        v.string(),
        v.transform(decodeURIComponent),
        v.check(URL.canParse),
        v.transform((u) => new URL(u)),
      ),
    }),
  ),
  async (c) => {
    if (!c.var.user) return c.json({ error: "Unauthorized" }, 401);
    const res = await proxy(c.req.valid("param").url);
    res.headers.delete("Set-Cookie");
    if (!res.headers.has("Cache-Control"))
      res.headers.set("Cache-Control", "private, max-age=86400");
    return res;
  },
);

api.all("*", (c) => c.json({ error: "Not Found" }, 404));

const app = new Hono<HonoCtx>().route("/api", api).get("*", (c) => c.env.ASSETS.fetch(c.req.url));

export default {
  fetch: app.fetch,
  email: emailHandler,
} satisfies ExportedHandler<CloudflareBindings>;
