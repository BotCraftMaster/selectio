import { eq } from "@selectio/db";
import { company } from "@selectio/db/schema";
import { protectedProcedure } from "../../trpc";

export const get = protectedProcedure.query(({ ctx }) => {
  return ctx.db.query.company.findFirst({
    where: eq(company.userId, ctx.session.user.id),
  });
});
