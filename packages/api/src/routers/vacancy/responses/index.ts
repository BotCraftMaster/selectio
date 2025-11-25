import type { TRPCRouterRecord } from "@trpc/server";

import { getById } from "./get-by-id";
import { list } from "./list";

export const responsesRouter = {
  list,
  getById,
} satisfies TRPCRouterRecord;
