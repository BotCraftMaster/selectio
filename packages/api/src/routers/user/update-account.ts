import { eq } from "@selectio/db";
import { user } from "@selectio/db/schema";
import { optimizeAvatar } from "@selectio/lib";
import { accountFormSchema } from "@selectio/validators";
import { protectedProcedure } from "../../trpc";

export const updateAccount = protectedProcedure
  .input(accountFormSchema)
  .mutation(async ({ ctx, input }) => {
    let optimizedImage = input.image;

    // Оптимизируем изображение, если оно передано
    if (input.image?.startsWith("data:image/")) {
      optimizedImage = await optimizeAvatar(input.image);
    }

    await ctx.db
      .update(user)
      .set({
        name: input.name,
        image: optimizedImage,
        updatedAt: new Date(),
      })
      .where(eq(user.id, ctx.session.user.id));

    return { success: true };
  });
