import type { TRPCRouterRecord } from "@trpc/server";

import { get } from "./get";
import { update } from "./update";

export const companyRouter = {
  get,
  update,
} satisfies TRPCRouterRecord;
