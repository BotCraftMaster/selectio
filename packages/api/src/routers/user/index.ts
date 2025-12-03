import type { TRPCRouterRecord } from "@trpc/server";

import { deleteAccount } from "./delete-account";
import { me } from "./me";
import { updateAccount } from "./update-account";

export const userRouter = {
  me,
  updateAccount,
  deleteAccount,
} satisfies TRPCRouterRecord;
