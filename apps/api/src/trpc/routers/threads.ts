import { router, userProcedure } from "../trpc";
import { email, thread } from "@api/db/schema";
import { and, desc, eq } from "drizzle-orm";
import * as v from "valibot";

export const threadRouter = router({
  getThreads: userProcedure
    .input(
      v.object({
        mailbox: v.string(),
        cursor: v.optional(v.number()),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { db, user } = ctx;
      const { mailbox, cursor } = input;
      const threads = await db.query.thread.findMany({
        where: and(eq(email.ownerId, user.id)),
        orderBy: desc(thread.updatedAt),
        columns: {
          publicId: true,
          subject: true,
          updatedAt: true,
        },
        with: {
          emails: {
            columns: {
              messageId: true,
              bodyText: true,
            },
            limit: 1,
          },
        },
      });
      return threads;
    }),
  getSingleThread: userProcedure
    .input(
      v.object({
        id: v.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { db, user } = ctx;
      const { id } = input;
      const neededThread = await db.query.thread.findFirst({
        where: and(eq(thread.publicId, id), eq(email.ownerId, user.id)),
        columns: {
          publicId: true,
          subject: true,
          updatedAt: true,
        },
        with: {
          emails: true,
        },
      });
      return neededThread;
    }),
});
