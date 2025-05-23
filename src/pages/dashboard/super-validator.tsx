import TopTeamsWithPdf from "~/components/participantsTable/topTeamsWithPdf";
import { api } from "~/utils/api";
import { Tabs, TabsContent } from "../../components/ui/tabs";
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
import { Label } from "@radix-ui/react-label";
import { Download, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

// Use this interface for local operations
interface LocalTeam {
  id: string;
  name: string;
  paymentStatus: string;
  totalScore?: number; // Add totalScore property
  IdeaSubmission: {
    track: string;
    pptUrl: string;
  } | null;
  Members: {
    id: string;
    email: string | null;
    name: string | null;
    College: {
      name: string;
    } | null;
  }[];
  Scores: {
    score: number;
    id?: number; // Make the other properties optional since they're not used in the component
    criteriaId?: string;
    judgeId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    teamId?: string;
  }[];
  members?: {
    email: string;
  }[];
}

const downloadCSV = (teams: LocalTeam[]) => {
  const headers = ['Team Name', 'Track', 'Members'];
  const csvData = teams.map(team => [
    team.name,
    team.IdeaSubmission?.track ?? 'N/A',
    team.members?.map((m: { email: string }) => m.email).join('; ') ?? ''
  ]);
  
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'teams_export.csv';
  link.click();
};

const downloadExcel = (teams: LocalTeam[]) => {
  const headers = ['Team Name', 'Track', 'Members'];
  const data = teams.map(team => [
    team.name,
    team.IdeaSubmission?.track ?? 'N/A',
    team.members?.map((m: { email: string }) => m.email).join('; ') ?? ''
  ]);
  
  const worksheet = [
    headers.join('\t'),
    ...data.map(row => row.join('\t'))
  ].join('\n');
  
  const blob = new Blob([worksheet], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'teams_export.xls';
  link.click();
};

export default function SuperVaildator() {
  const res = api.superValidator.getTop100.useQuery();
  const allTeams = res.data;
  const [selectedTeams, setSelectedTeams] = useState(res.data);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [trackQuery, setTrackQuery] = useState("ALL");

  const { data, status } = useSession();

  useEffect(() => {
    setSelectedTeams(() => {
      let partiallyFiltered = allTeams?.filter(team => 
        "IdeaSubmission" in team && team.IdeaSubmission !== null
      );

      const newSearchQuery = searchQuery.trim().toLowerCase();
      if (newSearchQuery !== "") {
        partiallyFiltered = partiallyFiltered?.filter((team) => {
          const teamName = team.name.toLowerCase();
          return (
            teamName.includes(newSearchQuery) ||
            team.id.includes(newSearchQuery)
          );
        });
      }

      if (trackQuery !== "ALL") {
        partiallyFiltered = partiallyFiltered?.filter(
          (team) => "IdeaSubmission" in team && team.IdeaSubmission && typeof team.IdeaSubmission === 'object' && team.IdeaSubmission !== null && "track" in team.IdeaSubmission && team.IdeaSubmission.track === trackQuery,
        );
      }

      return partiallyFiltered;
    });
  }, [
    res.data,
    searchQuery,
    trackQuery,
    allTeams,
  ]);

  if (status === "loading")
    return (
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner />
        </div>
    );

  if (!data?.user?.role || !["SUPER_VALIDATOR", "ADMIN"].includes(data.user.role)) {
    return <NotFound />;
  }

  return (
    <div>
      <Tabs defaultValue="teams" className="w-full">
        <TabsContent value="teams">
          <Card className="w-full max-w-[1500px] mx-auto mb-4">
            <CardHeader className="pb-3">
              <CardTitle>Super - Validator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Team ID/Name</Label>
                  <Input
                    placeholder="Search Team ID/Name"
                    className="w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Track</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">{trackQuery}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>
                        Submission Status
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        value={trackQuery}
                        onValueChange={(value: string) =>
                          setTrackQuery(value)
                        }
                      >
                        <DropdownMenuRadioItem value="ALL">
                          All
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="FINTECH">
                          Fintech
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="SUSTAINABLE_DEVELOPMENT">
                          Sustainable Development
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="HEALTHCARE">
                          Healthcare
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="LOGISTICS">
                          Logistics
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="OPEN_INNOVATION">
                          Open Innovation
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                {(searchQuery !== "" || trackQuery !== "ALL") && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSearchQuery("");
                      setTrackQuery("ALL");
                    }}
                  >
                    Reset Filters
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => selectedTeams && downloadCSV(selectedTeams)}
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => selectedTeams && downloadExcel(selectedTeams)}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full max-w-[1500px] mx-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Selection Window</CardTitle>
            </CardHeader>
            <CardContent>
              {!res ? (
                <Spinner size="large" />
              ) : (
                <TopTeamsWithPdf 
                  data={selectedTeams ? selectedTeams.map(team => ({
                    ...team,
                    Members: team.Members.map(member => ({
                      ...member,
                      College: member.College ?? { name: 'Unknown' } // Ensure College is never null
                    }))
                  })) : null} 
                  dataRefetch={res.refetch}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
