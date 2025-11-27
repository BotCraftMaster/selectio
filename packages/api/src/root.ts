import { companyRouter } from "./routers/company";
import { integrationRouter } from "./routers/integration";
import { userRouter } from "./routers/user";
import { vacancyRouter } from "./routers/vacancy";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  user: userRouter,
  vacancy: vacancyRouter,
  integration: integrationRouter,
  company: companyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
