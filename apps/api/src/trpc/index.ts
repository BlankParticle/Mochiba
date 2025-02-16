import { threadRouter } from "./routers/threads";
import { router } from "./trpc";

export const appRouter = router({
  threads: threadRouter,
});

export type AppRouter = typeof appRouter;
