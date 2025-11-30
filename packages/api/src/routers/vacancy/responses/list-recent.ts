import { desc } from "@selectio/db";
import { vacancyResponse } from "@selectio/db/schema";
import { protectedProcedure } from "../../../trpc";

export const listRecent = protectedProcedure.query(({ ctx }) => {
  return ctx.db.query.vacancyResponse.findMany({
    orderBy: [desc(vacancyResponse.createdAt)],
    limit: 5,
    with: {
      vacancy: true,
      screening: true,
    },
  });
});
