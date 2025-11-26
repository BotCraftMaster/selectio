import { eq } from "@selectio/db";
import { vacancyResponse } from "@selectio/db/schema";
import { z } from "zod/v4";
import { protectedProcedure } from "../../../trpc";

export const getById = protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(({ ctx, input }) => {
    return ctx.db.query.vacancyResponse.findFirst({
      where: eq(vacancyResponse.id, input.id),
      with: {
        vacancy: true,
        screening: true,
      },
    });
  });
