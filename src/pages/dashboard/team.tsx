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
  const res = api.team.getAttendanceList.useQuery();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTrack, setSelectedTrack] = useState<string>("ALL");
  const [presentTeamsCount, setPresentTeamsCount] = useState<number>(0);
  const [presentMembersCount, setPresentMembersCount] = useState<number>(0);

  const [selectedTeams, setSelectedTeams] = useState(res.data);

  const { data, status } = useSession();

  // Track options based on your existing system
  const trackOptions = [
    "ALL",
    "FINTECH",
    "HEALTHCARE",
    "SUSTAINABLE_DEVELOPMENT",
    "LOGISTICS",
    "OPEN_INNOVATION"
  ];
  
  // Calculate present teams and members count
  useEffect(() => {
    if (res.data) {
      const presentTeams = res.data.filter(team => team.attended === true);
      setPresentTeamsCount(presentTeams.length);
      
      // Calculate total members from present teams - fix the counting logic
      const totalMembers = presentTeams.reduce((acc, team) => {
        // Only count the actual members without adding extra person
        return acc + (team.Members?.length || 0);
      }, 0);
      
      setPresentMembersCount(totalMembers);
    }
  }, [res.data]);

  useEffect(() => {
    setSelectedTeams(() => {
      if (!res) return [];
      
      let filteredTeams = res.data;
      
      // Filter by search query
      if (searchQuery !== "") {
        const newSearchQuery = searchQuery.trim().toLowerCase();
        filteredTeams = filteredTeams?.filter((team) => {
          const teamName = team.name.toLowerCase();
          return (
            teamName.includes(newSearchQuery) || team.teamNo.toString().includes(newSearchQuery)
          );
        });
      }
      
      // Filter by track
      if (selectedTrack !== "ALL") {
        filteredTeams = filteredTeams?.filter((team) => {
          return team.IdeaSubmission?.track === selectedTrack;
        });
      }
      
      return filteredTeams;
    });
  }, [res.data, searchQuery, selectedTrack, res]);

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
            <CardTitle>Attendance Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg">
                <span className="text-3xl font-bold text-green-400">{presentTeamsCount}</span>
                <span className="text-sm text-gray-300">Teams Present</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg">
                <span className="text-3xl font-bold text-blue-400">{presentMembersCount}</span>
                <span className="text-sm text-gray-300">Members Present</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full mx-auto mb-4">
          <CardHeader className="pb-3">
            <CardTitle>Search & Filter Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Team ID/Name</p>
                <Input
                  placeholder="Search Team ID/Name"
                  className="w-full text-gray-300 focus:border-gray-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Track</p>
                <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                  <SelectTrigger className="text-gray-300">
                    <SelectValue placeholder="Select Track" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    <SelectGroup>
                      <SelectLabel>Track</SelectLabel>
                      {trackOptions.map(track => (
                        <SelectItem key={track} value={track}>
                          {track === "OPEN_INNOVATION" ? "Open Innovation" : 
                            track.charAt(0).toUpperCase() + track.slice(1).toLowerCase()}
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
                    (team) =>
                      team.teamProgress === "SELECTED" ||
                      team.teamProgress === "TOP15" ||
                      team.teamProgress === "WINNER" ||
                      team.teamProgress === "RUNNER" ||
                      team.teamProgress === "SECOND_RUNNER" ||
                      team.teamProgress === "TRACK",
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
