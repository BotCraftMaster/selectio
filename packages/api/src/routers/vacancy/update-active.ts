import { inngest } from "@selectio/jobs";
import { protectedProcedure } from "../../trpc";

export const updateActive = protectedProcedure.mutation(async () => {
  await inngest.send({
    name: "vacancy/update.active",
    data: {},
  });
  return { success: true };
});
