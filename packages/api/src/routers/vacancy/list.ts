import { desc, vacancy } from "@selectio/db";
import { protectedProcedure } from "../../trpc";

export const list = protectedProcedure.query(({ ctx }) => {
  return ctx.db.query.vacancy.findMany({
    orderBy: [desc(vacancy.createdAt)],
  });
});
