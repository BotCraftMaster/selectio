import { eq } from "@selectio/db";
import { companySettings } from "@selectio/db/schema";
import { workspaceIdSchema } from "@selectio/validators";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const get = protectedProcedure
  .input(z.object({ workspaceId: workspaceIdSchema }))
  .query(async ({ ctx, input }) => {
    const result = await ctx.db.query.companySettings.findFirst({
      where: eq(companySettings.workspaceId, input.workspaceId),
    });

    return result ?? null;
  });
