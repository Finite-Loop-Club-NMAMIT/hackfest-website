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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { toast } from '../ui/toast';
import { ChevronUp, ChevronDown } from "lucide-react";

const SelectionWindow = () => {
  const teamData = api.team.getTeamsByTotalScore.useQuery();
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [notSelectedPage, setNotSelectedPage] = useState(1);
  const [semiSelectedPage, setSemiSelectedPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Get unique tracks from team submissions
  const tracks = teamData.data ? 
    Array.from(new Set(
      teamData.data
        .filter(team => team.IdeaSubmission?.track)
        .map(team => team.IdeaSubmission?.track)
    )).filter(Boolean) as string[] 
    : [];


  const moveToTop100 = api.team.moveToTop100.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Team moved to Top 100",
      });
      void teamData.refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetToTop100 = api.team.resetToTop100.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Team moved back to Top 100",
      });
      void teamData.refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetTeamProgress = api.team.resetTeamProgress.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Team removed from selection",
      });
      void teamData.refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Function to handle track filter change
  const handleTrackChange = (value: string) => {
    setSelectedTrack(value);
  };

  // Filter teams based on selected track and team progress
  const getFilteredTeams = (progressStatus: string) => {
    const filtered = teamData.data?.filter((team) => {
      // First filter for idea submission
      if (!team.IdeaSubmission) return false;
      
      // Then filter by track if not "all"
      const matchesTrack = selectedTrack === "all" || team.IdeaSubmission.track === selectedTrack;
      
      // Filter by teamProgress status
      const matchesProgress = team.teamProgress === progressStatus;
      
      return matchesTrack && matchesProgress;
    });

    // Sort teams by total score in descending order
    return filtered?.sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0));
  };

  const notSelectedTeams = getFilteredTeams("NOT_SELECTED");
  const semiSelectedTeams = getFilteredTeams("SEMI_SELECTED");
  const selectedTeams = getFilteredTeams("SELECTED");

  // Handlers for moving teams between states
  const handleMoveToTop100 = (teamId: string) => {
    moveToTop100.mutate({ teamId });
  };


  const handleMoveBackToTop100 = (teamId: string) => {
    resetToTop100.mutate({ teamId });
  };

  const handleRemoveFromSelection = (teamId: string) => {
    resetTeamProgress.mutate({ teamId });
  };

  if (teamData.isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Function to count teams by track and generate summary
  const getTrackCountSummary = (teams: typeof teamData.data) => {
    if (!teams || teams.length === 0) return "";
    
    const trackCounts: Record<string, number> = {};
    
    teams.forEach(team => {
      const track = team.IdeaSubmission?.track ?? "Unknown";
      trackCounts[track] = (trackCounts[track] ?? 0) + 1;
    });
    
    return Object.entries(trackCounts)
      .map(([track, count]) => `${track}: ${count}`)
      .join(" | ");
  };

  // Add pagination helper function
  const paginateTeams = (teams: typeof teamData.data, page: number) => {
    if (!teams) return [];
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return teams.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  // Render table for a specific team progress status
  const renderTeamTable = (teams: typeof teamData.data, title: string, status: string, currentPage?: number, setPage?: (page: number) => void) => (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="text-sm text-muted-foreground">
          {teams?.length ?? 0} teams
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {teams && teams.length > 0 && (
          <div className="text-xs text-muted-foreground mb-2">
            {getTrackCountSummary(teams)}
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Sl. No.</TableHead>
              <TableHead>Team Name</TableHead>
              <TableHead>Track</TableHead>
              <TableHead>Submission</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(currentPage ? paginateTeams(teams, currentPage) : teams)?.map((team, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {currentPage ? (currentPage - 1) * ITEMS_PER_PAGE + index + 1 : index + 1}
                </TableCell>
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
                <TableCell className="text-right font-bold">{team.totalScore}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {status === "NOT_SELECTED" && (
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleMoveToTop100(team.id)}
                        disabled={moveToTop100.isLoading}
                        title="Move to Top 100"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {status === "SEMI_SELECTED" && (
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleRemoveFromSelection(team.id)}
                        disabled={resetTeamProgress.isLoading}
                        title="Remove from Selection"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {status === "SELECTED" && (
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleMoveBackToTop100(team.id)}
                        disabled={resetToTop100.isLoading}
                        title="Move back to Top 100"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {teams?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No teams found matching the filter criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {currentPage && setPage && teams && teams.length > ITEMS_PER_PAGE && (
          <div className="flex justify-end items-center space-x-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {Math.ceil((teams?.length || 0) / ITEMS_PER_PAGE)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= Math.ceil((teams?.length || 0) / ITEMS_PER_PAGE)}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

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
      
      {/* Tabs for different team categories */}
      <div className="w-full max-w-[1500px] mx-auto">
        <Tabs defaultValue="splitView">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="splitView">Split View</TabsTrigger>
            <TabsTrigger value="notSelected">Not Selected Teams</TabsTrigger>
            <TabsTrigger value="semiSelected">Top 100 Teams</TabsTrigger>
            <TabsTrigger value="selected">Top 60 Teams</TabsTrigger>
          </TabsList>
          
          {/* Split view tab - shows only Not Selected and Top 100 */}
          <TabsContent value="splitView">
            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full">
                  {renderTeamTable(notSelectedTeams, "Not Selected Teams", "NOT_SELECTED", notSelectedPage, setNotSelectedPage)}
                </div>
                <div className="w-full">
                  {renderTeamTable(semiSelectedTeams, "Top 100 Teams", "SEMI_SELECTED", semiSelectedPage, setSemiSelectedPage)}
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Individual category tabs */}
          <TabsContent value="notSelected">
            {renderTeamTable(notSelectedTeams, "Not Selected Teams", "NOT_SELECTED")}
          </TabsContent>
          
          <TabsContent value="semiSelected">
            {renderTeamTable(semiSelectedTeams, "Top 100 Teams", "SEMI_SELECTED")}
          </TabsContent>
          
          <TabsContent value="selected">
            {renderTeamTable(selectedTeams, "Top 60 Teams", "SELECTED")}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default SelectionWindow
