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
  }, [res.data, searchQuery, paymentQuery, res]);

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
      <div className="flex w-full flex-col items-center justify-center gap-6 py-4 opacity-100 transition-opacity duration-600">
        <h1 className="text-3xl font-semibold md:text-5xl bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent mt-24 mb-8">
          Volunteer Dashboard
        </h1>
        <div className="flex w-full flex-col items-center justify-center gap-y-2 bg-gradient-to-b from-gray-900 to-gray-800 p-6 rounded-lg shadow-md transition-shadow duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] text-gray-200 my-8">
          <span className="text-xl">
            Hey there {data.user.name} 👋
          </span>
          <p className="text-gray-400 mt-2">
            Manage and track participants&apos; information below
          </p>
        </div>
      </div>
      <div className="m-auto overflow-x-scroll md:max-w-screen-xl mb-24">
        <h1 className="my-8 text-center text-2xl font-bold text-gray-300">Participants</h1>
        <div className="my-4 flex h-full w-full flex-col items-center justify-around gap-3 md:flex-row">
          <Input
            placeholder="Search Team ID/Name"
            className="w-52 bg-gray-800 border-gray-700 text-gray-300 focus:border-gray-500"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-gradient-to-r from-gray-800 to-gray-700 text-gray-200 border-gray-600 hover:bg-gray-700 transition-all duration-300 hover:border-gray-500">
                {paymentQuery}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700 text-gray-200">
              <DropdownMenuLabel>Payment Status</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuRadioGroup
                value={paymentQuery}
                onValueChange={(value) => setPaymentQuery(value)}
              >
                <DropdownMenuRadioItem value="ALL" className="hover:bg-gray-700">All</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="PAID" className="hover:bg-gray-700">Paid</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="PENDING" className="hover:bg-gray-700">
                  Pending
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="FAILED" className="hover:bg-gray-700">
                  Failed
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="rounded-md border border-gray-700 bg-gradient-to-b from-gray-900 to-gray-800 shadow-md transition-all duration-500">
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
      </div>
    </DashboardLayout>
  );
}
