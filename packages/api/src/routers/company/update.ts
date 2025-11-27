import { eq } from "@selectio/db";
import { company } from "@selectio/db/schema";
import { companyFormSchema } from "@selectio/validators";
import { protectedProcedure } from "../../trpc";

export const update = protectedProcedure
  .input(companyFormSchema)
  .mutation(async ({ ctx, input }) => {
    const existing = await ctx.db.query.company.findFirst({
      where: eq(company.userId, ctx.session.user.id),
    });

    if (existing) {
      await ctx.db
        .update(company)
        .set({
          name: input.name,
          website: input.website || null,
          description: input.description || null,
          updatedAt: new Date(),
        })
        .where(eq(company.id, existing.id));
    } else {
      await ctx.db.insert(company).values({
        id: crypto.randomUUID(),
        userId: ctx.session.user.id,
        name: input.name,
        website: input.website || null,
        description: input.description || null,
      });
    }

    return { success: true };
  });
