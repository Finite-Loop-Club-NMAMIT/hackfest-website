import DashboardLayout from "~/components/layout/dashboardLayout";
import FinalParticipantsTable from "~/components/teamDashboard/finalParticipantsTable";
import { api } from "~/utils/api";
import { Input } from "~/components/ui/input";
import { useEffect, useState } from "react";
import Spinner from "~/components/spinner";

import { useSession } from "next-auth/react";
import NotFound from "../404";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export default function TeamAttendance() {
  const res = api.team.getTeamsList.useQuery();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [judgeSearchQuery] = useState<string>("");

  const [selectedTeams, setSelectedTeams] = useState(res.data);
  const [paymentQuery, setPaymentQuery] = useState("ALL");
  const [selectedJudge, setSelectedJudge] = useState("ALL");

  const { data, status } = useSession();

  // Simulated judges data (replace with actual API call if available)
  const judges = [
    { id: "1", name: "Judge One" },
    { id: "2", name: "Judge Two" },
    { id: "3", name: "Judge Three" },
    { id: "4", name: "Judge Four" },
  ];

  const filteredJudges = judges.filter(judge => 
    judge.name.toLowerCase().includes(judgeSearchQuery.toLowerCase())
  );

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
    <div className="overflow-x-hidden">
      <div className="flex w-full flex-col items-center justify-center gap-6 py-4 opacity-100 transition-opacity duration-600">
        <h1 className="text-3xl font-semibold md:text-5xl bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent">
          Volunteer Dashboard
        </h1>
      </div>
      <div className="m-auto px-4 md:px-0 md:max-w-[1500px] mb-24">
        <Card className="w-full mx-auto mb-4">
          <CardHeader className="pb-3">
            <CardTitle>Search & Filter Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Team ID/Name</p>
                <Input
                  placeholder="Search Team ID/Name"
                  className="w-full  text-gray-300 focus:border-gray-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Payment Status</p>
                <Select value={paymentQuery} onValueChange={setPaymentQuery}>
                  <SelectTrigger className=" text-gray-300">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent className="">
                    <SelectGroup>
                      <SelectLabel>Status</SelectLabel>
                      <SelectItem value="ALL">All</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Assign Judge</p>
                <Select value={selectedJudge} onValueChange={setSelectedJudge}>
                  <SelectTrigger className=" text-gray-300">
                    <SelectValue placeholder="Select Judge" />
                  </SelectTrigger>
                  <SelectContent className=" max-h-[200px]">
                    <SelectGroup>
                      <SelectLabel>Judge</SelectLabel>
                      <SelectItem value="ALL">All Judges</SelectItem>
                      {filteredJudges.map(judge => (
                        <SelectItem key={judge.id} value={judge.name}>
                          {judge.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Participants List</CardTitle>
            <div className="text-sm text-muted-foreground">
              {selectedTeams?.length ?? 0} teams
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="rounded-md shadow-md transition-all duration-500">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
