import { userRouter } from "./routers/user";
import { vacancyRouter } from "./routers/vacancy";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  user: userRouter,
  vacancy: vacancyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
