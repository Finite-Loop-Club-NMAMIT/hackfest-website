import React, { useState } from "react";
import {
  TableHeader,
  TableRow,
  Table,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import { toast } from "~/components/ui/toast";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

// Updated Team interface with totalScore property
interface Team {
  id: string;
  name: string;
  paymentStatus: string;
  teamProgress?: string;
  totalScore?: number; // We'll use this for sorting but not display it
  Members: {
    College: {
      name: string;
    };
  }[];
  IdeaSubmission: {
    track: string;
    pptUrl: string;
  } | null;
}

interface TopTeamsWithPdfProps {
  data: Team[] | null | undefined;
  dataRefetch: () => void;
}

const TopTeamsWithPdf: React.FC<TopTeamsWithPdfProps> = ({ data, dataRefetch }) => {
  // Add state for confirmation dialog
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"moveToTop60" | "moveBackToTop100">();
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [selectedTeamName, setSelectedTeamName] = useState<string>("");

  // Mutation for moving team to Top 60
  const moveToTop60 = api.team.moveToTop60.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Team moved to Top 60",
      });
      void dataRefetch();
    },
    onError: (error: { message: string }) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for moving team back to Top 100
  const moveBackToTop100 = api.team.resetToTop100.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Team moved back to Top 100",
      });
      void dataRefetch();
    },
    onError: (error: { message: string }) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Modified handlers to open confirmation dialog
  const handleMoveToTop60 = (teamId: string, teamName: string) => {
    setSelectedTeamId(teamId);
    setSelectedTeamName(teamName);
    setConfirmAction("moveToTop60");
    setIsConfirmOpen(true);
  };

  const handleMoveBackToTop100 = (teamId: string, teamName: string) => {
    setSelectedTeamId(teamId);
    setSelectedTeamName(teamName);
    setConfirmAction("moveBackToTop100");
    setIsConfirmOpen(true);
  };

  // Function to handle confirmation
  const handleConfirm = () => {
    if (!selectedTeamId) return;

    switch (confirmAction) {
      case "moveToTop60":
        moveToTop60.mutate({ teamId: selectedTeamId });
        break;
      case "moveBackToTop100":
        moveBackToTop100.mutate({ teamId: selectedTeamId });
        break;
    }

    setIsConfirmOpen(false);
  };

  // Get confirmation message based on action
  const getConfirmationMessage = () => {
    switch (confirmAction) {
      case "moveToTop60":
        return `Are you sure you want to move "${selectedTeamName}" to Top 60?`;
      case "moveBackToTop100":
        return `Are you sure you want to move "${selectedTeamName}" back to Top 100?`;
      default:
        return "Are you sure you want to perform this action?";
    }
  };

  // Filter teams for Top 100 and Top 60 tables
  const top100Teams = data?.filter(team => team.teamProgress === "SEMI_SELECTED") ?? [];
  const top60Teams = data?.filter(team => team.teamProgress === "SELECTED") ?? [];

  // Count teams by track for selected teams (Top 60)
  const getTrackCounts = () => {
    const trackCounts: Record<string, number> = {};

    top60Teams.forEach(team => {
      const track = team.IdeaSubmission?.track ?? "Unspecified";
      trackCounts[track] = (trackCounts[track] ?? 0) + 1;
    });

    return trackCounts;
  };

  const trackCounts = getTrackCounts();

  // Get unique college names for a team
  const getTeamColleges = (team: Team) => {
    const collegeNames = team.Members
      ?.map(member => member.College?.name)
      .filter((name): name is string => !!name);

    // Get unique college names
    const uniqueColleges = [...new Set(collegeNames)];

    return uniqueColleges.join(", ") || "N/A";
  };

  return (
    <div className="space-y-4">
      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {getConfirmationMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Yes, proceed</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stats Section - Redesigned to be more minimal */}
      <div className="border-b border-border pb-2 text-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="text-muted-foreground">
            Selected: <span className="font-medium text-foreground">{top60Teams.length}</span>
          </span>

          {Object.entries(trackCounts).map(([track, count]) => (
            <span key={track} className="text-muted-foreground">
              {track}: <span className="font-medium text-foreground">{count}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full">
        {/* Top 100 Teams Table */}
        <div className="w-full md:w-1/2">
          <h2 className="text-xl font-bold mb-4">Top 100 Teams</h2>
          <div className="text-sm text-muted-foreground">
            {top100Teams?.length ?? 0} teams
          </div>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Track</TableHead>
                  <TableHead>Submission</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top100Teams.length > 0 ? (
                  top100Teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>{getTeamColleges(team)}</TableCell>
                      <TableCell>{team.IdeaSubmission?.track ?? "N/A"}</TableCell>
                      <TableCell>
                        {team.IdeaSubmission?.pptUrl ? (
                          <a
                            href={team.IdeaSubmission.pptUrl.split(";")[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              View PDF
                            </Button>
                          </a>
                        ) : (
                          "No submission"
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleMoveToTop60(team.id, team.name)}
                          disabled={moveToTop60.isLoading}
                          title="Move to Top 60"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No teams found in Top 100
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Top 60 Teams Table */}
        <div className="w-full md:w-1/2">
          <h2 className="text-xl font-bold mb-4">Top 60 Teams</h2>
          <div className="text-sm text-muted-foreground">
            {top60Teams?.length ?? 0} teams
          </div>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Track</TableHead>
                  <TableHead>Submission</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top60Teams.length > 0 ? (
                  top60Teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>{getTeamColleges(team)}</TableCell>
                      <TableCell>{team.IdeaSubmission?.track ?? "N/A"}</TableCell>
                      <TableCell>
                        {team.IdeaSubmission?.pptUrl ? (
                          <a
                            href={team.IdeaSubmission.pptUrl.split(";")[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              View PDF
                            </Button>
                          </a>
                        ) : (
                          "No submission"
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleMoveBackToTop100(team.id, team.name)}
                          disabled={moveBackToTop100.isLoading}
                          title="Move back to Top 100"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No teams found in Top 60
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopTeamsWithPdf;
