import type { TRPCRouterRecord } from "@trpc/server";

import { getById } from "./get-by-id";
import { list } from "./list";
import { listAll } from "./list-all";

export const responsesRouter = {
  list,
  listAll,
  getById,
} satisfies TRPCRouterRecord;
