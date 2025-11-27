import { getSession } from "~/auth/server";
import {
  ActiveVacancies,
  DashboardStats,
  RecentResponses,
  ResponsesChart,
} from "~/components/dashboard";
import { SiteHeader } from "~/components/layout";

export default async function Page() {
  const session = await getSession();
  const useSiteHeader = !!session?.user;
  return (
    <>
      {useSiteHeader && <SiteHeader />}
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <DashboardStats />
            <div className="grid gap-4 px-4 lg:px-6 md:grid-cols-2">
              <RecentResponses />
              <ActiveVacancies />
            </div>
            <div className="px-4 lg:px-6">
              <ResponsesChart />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
