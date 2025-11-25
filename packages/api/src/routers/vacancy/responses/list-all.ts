import { desc, vacancyResponse } from "@selectio/db";

import { protectedProcedure } from "../../../trpc";

export const listAll = protectedProcedure.query(({ ctx }) => {
  return ctx.db.query.vacancyResponse.findMany({
    orderBy: [desc(vacancyResponse.createdAt)],
    with: {
      vacancy: true,
    },
  });
});
