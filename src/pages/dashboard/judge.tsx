import DashboardLayout from "~/components/layout/dashboardLayout";
import { api } from "~/utils/api";
import Spinner from "~/components/spinner";
import { useSession } from "next-auth/react";
import NotFound from "~/components/not-found";
import DAY1 from "~/components/judge/day1";
import DAY2 from "~/components/judge/day2";
import DAY3 from "~/components/judge/day3";

export default function Judge() {
  const { data, status } = useSession();
  const judgeDay = api.judges.getDay.useQuery().data;

  if (status === "loading")
    return (
      <DashboardLayout>
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner />
        </div>
      </DashboardLayout>
    );

  if (!data || !data.user || data.user.role !== "JUDGE") {
    return <NotFound />;
  }

  return(
    <>
      <DashboardLayout>
        {
          judgeDay?.type === "DAY1" && <DAY1 />
        }
        {
          judgeDay?.type === "DAY2" && <DAY2 />
        }
        {
          judgeDay?.type === "DAY3" && <DAY3 />
        }
      </DashboardLayout>
    </>
  )
      
}
