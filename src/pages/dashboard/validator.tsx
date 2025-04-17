import {
  TableHeader,
  TableRow,
  Table,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Spinner from "~/components/spinner";
import NotFound from "../404";
import { Button } from "~/components/ui/button";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function Validator() {
  const { data: sessionData, status } = useSession();
  const teamData = api.team.getTeamsList.useQuery();
  const { data: criteria, isLoading: criteriaLoading } = api.validator.getValidatorCriteria.useQuery();
  const { data: allScores, isLoading: scoresLoading, refetch: refetchScores } = api.validator.getAllScores.useQuery();
  const [selectedRatings, setSelectedRatings] = useState<Record<string, number>>({});
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  
  // Get unique tracks from team submissions
  const tracks = teamData.data ? 
    Array.from(new Set(
      teamData.data
        .filter(team => team.IdeaSubmission?.track)
        .map(team => team.IdeaSubmission?.track)
    )).filter(Boolean) as string[] 
    : [];
  
  const submitScore = api.validator.setScore.useMutation({
    onSuccess: async () => {
      toast.dismiss("submitting-score");
      toast.success("Score submitted");
      await teamData.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const clearScore = api.validator.clearScore.useMutation({
    onSuccess: async () => {
      toast.success("Score cleared");
      await Promise.all([
        teamData.refetch(),
        refetchScores(),
      ]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleClearRating = (teamId: string) => {
    setSelectedRatings(prev => {
      const newRatings = { ...prev };
      delete newRatings[teamId];
      return newRatings;
    });

    clearScore.mutate({
      criteriaId: criteria?.id ?? "",
      teamId: teamId,
    });
  };

  // Initialize selectedRatings with existing scores from the database when they load
  useEffect(() => {
    if (allScores) {
      const existingRatings: Record<string, number> = {};
      allScores.forEach(score => {
        // Convert score back to star rating
        let starRating = 0;
        if (score.score <= 2) starRating = 1;
        else if (score.score <= 4) starRating = 2;
        else if (score.score <= 6) starRating = 3;
        else if (score.score <= 8) starRating = 4;
        else starRating = 5;
        
        existingRatings[score.teamId] = starRating;
      });
      setSelectedRatings(existingRatings);
    }
  }, [allScores]);

  // Handle star selection with auto-submit
  const handleStarClick = (teamId: string, rating: number) => {
    setSelectedRatings(prev => ({
      ...prev,
      [teamId]: rating
    }));
    
    // Convert rating to score (1 star = 2, 2 stars = 4, 3 stars = 6, 4 stars = 8, 5 stars = 10)
    const scoreMap = {
      1: 2,
      2: 4,
      3: 6,
      4: 8,
      5: 10
    };
    
    const score = scoreMap[rating as 1|2|3|4|5];
    
    // Auto-submit on star click
    submitScore.mutate({
      criteriaId: criteria?.id ?? "",
      teamId: teamId,
      score: score,
    });
  };

  if (status === "loading" || criteriaLoading || scoresLoading)
    return (
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner />
        </div>
    );

  if (
    !sessionData?.user ||
    (sessionData.user.role !== "VALIDATOR" && sessionData.user.role !== "ADMIN")
  ) {
    return <NotFound />;
  }

  // Function to get submitted score for a team
  const getTeamScore = (teamId: string) => {
    if (!allScores) return 0;
    
    const score = allScores.find(score => score.teamId === teamId);
    if (!score) return 0;
    
    // Convert score back to star rating
    if (score.score <= 2) return 1;
    if (score.score <= 4) return 2;
    if (score.score <= 6) return 3;
    if (score.score <= 8) return 4;
    return 5;
  };

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

  return (
    !teamData.isLoading && (
      <div className="container mx-auto">      
        <Card className="w-full max-w-[1500px] mx-auto mb-4">
          <CardHeader>
            <CardTitle className="text-3xl">Validator Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-muted-foreground">
                <p>Hey there {sessionData.user.name} 👋</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Select star rating for each team (1 to 5 stars)</li>
                  <li>Ratings are automatically submitted when you click a star</li>
                  <li>Submitted ratings will be highlighted in yellow</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full max-w-[1500px] mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Team Submissions</CardTitle>
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
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[1000px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Sl. No.</TableHead>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Track</TableHead>
                    <TableHead className="text-center">PPT</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeams?.map((team, index) => {
                    const submittedScore = getTeamScore(team.id);
                    const currentRating = selectedRatings[team.id] ?? submittedScore;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{team.name}</TableCell>
                        <TableCell>{team.IdeaSubmission?.track ?? "N/A"}</TableCell>
                        <TableCell className="text-center">
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(team.IdeaSubmission?.pptUrl.split(";")[0], "_blank")}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View PDF
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-4">
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => handleStarClick(team.id, star)}
                                  className="focus:outline-none transition-colors"
                                >
                                  <span className={`text-2xl ${currentRating >= star ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                                    ★
                                  </span>
                                </button>
                              ))}
                            </div>
                            {selectedRatings[team.id] && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleClearRating(team.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Clear
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredTeams?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No teams found for the selected track
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>  
    )
  );
}
