import React, { useState } from 'react'
import { api } from "~/utils/api";
import Spinner from "~/components/spinner";
import {
  TableHeader,
  TableRow,
  Table,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

const SelectionWindow = () => {
  const teamData = api.team.getTeamsList.useQuery();
  const [selectedTrack, setSelectedTrack] = useState<string>("all");

  // Get unique tracks from team submissions
  const tracks = teamData.data ? 
    Array.from(new Set(
      teamData.data
        .filter(team => team.IdeaSubmission?.track)
        .map(team => team.IdeaSubmission?.track)
    )).filter(Boolean) as string[] 
    : [];

  // Function to handle track filter change
  const handleTrackChange = (value: string) => {
    setSelectedTrack(value);
  };

  // Filter teams based on selected track
  const filteredTeams = teamData.data?.filter((team) => {
    // First filter for idea submission
    if (!team.IdeaSubmission) return false;
    
    // Then filter by track if not "all"
    return selectedTrack === "all" || team.IdeaSubmission.track === selectedTrack;
  });

  if (teamData.isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="w-full max-w-[1500px] mx-auto mb-4">
        <CardHeader className="pb-3">
          <CardTitle>Filter Teams by Track</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end">
            <Select value={selectedTrack} onValueChange={handleTrackChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by track" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tracks</SelectItem>
                {tracks.map((track, index) => (
                  <SelectItem key={index} value={track}>{track}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card className="w-full max-w-[1500px] mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Team Submissions</CardTitle>
          <div className="text-sm text-muted-foreground">
            {filteredTeams?.length ?? 0} teams
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Sl. No.</TableHead>
                <TableHead>Team Name</TableHead>
                <TableHead>Track</TableHead>
                <TableHead>Submission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams?.map((team, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{team.name}</TableCell>
                  <TableCell>{team.IdeaSubmission?.track ?? "N/A"}</TableCell>
                  <TableCell>
                    <a
                      href={team.IdeaSubmission?.pptUrl.split(";")[0]}
                      target="_blank"
                    >
                      <Button variant="outline" size="sm">
                        View PDF
                      </Button>
                    </a>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTeams?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No teams found matching the filter criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default SelectionWindow
