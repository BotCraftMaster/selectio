import { createTRPCRouter } from "../../trpc";
import { getById } from "./get-by-id";
import { list } from "./list";
import { responsesRouter } from "./responses";

export const vacancyRouter = createTRPCRouter({
  list,
  getById,
  responses: createTRPCRouter(responsesRouter),
});
