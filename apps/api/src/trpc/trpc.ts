import { initTRPC, TRPCError } from "@trpc/server";
import type { HonoCtx } from "@api/types";
import type { Context } from "hono";
import SuperJSON from "superjson";

export type TrpcContext = {
  c: Context<HonoCtx>;
  env: CloudflareBindings;
} & HonoCtx["Variables"];

const t = initTRPC.context<TrpcContext>().create({ transformer: SuperJSON });

export const router = t.router;

export const publicProcedure = t.procedure;

export const userProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user || !ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      session: ctx.session,
    },
  });
});
