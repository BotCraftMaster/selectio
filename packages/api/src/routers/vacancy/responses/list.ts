import { desc, eq, vacancyResponse } from "@selectio/db";
import { z } from "zod/v4";

import { protectedProcedure } from "../../../trpc";

export const list = protectedProcedure
  .input(z.object({ vacancyId: z.string() }))
  .query(({ ctx, input }) => {
    return ctx.db.query.vacancyResponse.findMany({
      where: eq(vacancyResponse.vacancyId, input.vacancyId),
      orderBy: [desc(vacancyResponse.createdAt)],
    });
  });
