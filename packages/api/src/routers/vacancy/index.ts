import { createTRPCRouter } from "../../trpc";
import { getAnalytics } from "./get-analytics";
import { getById } from "./get-by-id";
import { getDashboardStats } from "./get-dashboard-stats";
import { getResponsesChartData } from "./get-responses-chart-data";
import { list } from "./list";
import { responsesRouter } from "./responses";

export const vacancyRouter = createTRPCRouter({
  list,
  getById,
  getAnalytics,
  getDashboardStats,
  getResponsesChartData,
  responses: createTRPCRouter(responsesRouter),
});
