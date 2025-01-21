import DownloadDataButtons from "~/components/downloadData";
import FaqAdmin from "~/components/faq/faqAdmin";
import DashboardLayout from "~/components/layout/dashboardLayout";
import FinalParticipantsTable from "~/components/teamDashboard/finalParticipantsTable";
import { api } from "~/utils/api";
import { Input } from "~/components/ui/input";
import { useEffect, useState } from "react";
import Spinner from "~/components/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { useSession } from "next-auth/react";
import NotFound from "../404";

export default function Team() {
  const res = api.team.getTeamsList.useQuery();
  const users = api.user.getAllUsers.useQuery().data;
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [selectedTeams, setSelectedTeams] = useState(res.data);
  const [paymentQuery, setPaymentQuery] = useState("ALL");

  const { data, status } = useSession();

  useEffect(() => {
    setSelectedTeams(() => {
      if (!res) return [];
      if (searchQuery === "" && paymentQuery === "ALL") return res.data;
      const newSearchQuery = searchQuery.trim().toLowerCase();
      const partiallyFiltered = res?.data?.filter((team) => {
        const teamName = team.name.toLowerCase();
        return (
          teamName.includes(newSearchQuery) || team.id.includes(newSearchQuery)
        );
      });
      if (paymentQuery === "ALL") return partiallyFiltered;
      return partiallyFiltered?.filter(
        (team) => team.paymentStatus === paymentQuery,
      );
    });
  }, [res.data, searchQuery, paymentQuery]);

  if (status === "loading")
    return (
      <DashboardLayout>
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner />
        </div>
      </DashboardLayout>
    );

  if (
    !data ||
    !data.user ||
    (data.user.role !== "TEAM" && data.user.role !== "ADMIN")
  ) {
    return <NotFound />;
  }

  return (
    <DashboardLayout>
      <div className="w-full border-b">
        <h1 className="py-10 text-center text-4xl font-bold">
          Volunteer Dashboard
        </h1>
      </div>
      <div className="m-auto overflow-x-scroll md:max-w-screen-xl">
        <h1 className="my-8 text-center text-2xl font-bold">Participants</h1>
        <div className="my-4 flex h-full w-full flex-col items-center justify-around gap-3 md:flex-row">
          {/* <DownloadDataButtons /> */}
          <Input
            placeholder="Search Team ID/Name"
            className="w-52"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">{paymentQuery}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Payment Staus</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={paymentQuery}
                onValueChange={(value) => setPaymentQuery(value)}
              >
                <DropdownMenuRadioItem value="ALL">All</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="PAID">Paid</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="PENDING">
                  Pending
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="FAILED">
                  Failed
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {!res ? (
          <Spinner size="large" />
        ) : (
          <FinalParticipantsTable
            data={selectedTeams?.filter(
              (team) => team.teamProgress === "SELECTED",
            )}
            dataRefecth={res.refetch}
          />
        )}
      </div>
      <div></div>
    </DashboardLayout>
  );
}
