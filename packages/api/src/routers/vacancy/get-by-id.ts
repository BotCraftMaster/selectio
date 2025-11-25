import { eq, vacancy } from "@selectio/db";
import { z } from "zod/v4";
import { protectedProcedure } from "../../trpc";

export const getById = protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(({ ctx, input }) => {
    return ctx.db.query.vacancy.findFirst({
      where: eq(vacancy.id, input.id),
    });
  });
