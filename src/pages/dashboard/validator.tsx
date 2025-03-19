import {
  TableHeader,
  TableRow,
  Table,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import { api } from "~/utils/api";
import DashboardLayout from "~/components/layout/dashboardLayout";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Spinner from "~/components/spinner";
import NotFound from "../404";
import { Button } from "~/components/ui/button";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

export default function Validator() {
  const { data: sessionData, status } = useSession();
  const teamData = api.team.getTeamsList.useQuery();
  const { data: criteria, isLoading: criteriaLoading } = api.validator.getValidatorCriteria.useQuery();
  const { data: allScores, isLoading: scoresLoading } = api.validator.getAllScores.useQuery();
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

  if (submitScore.isLoading) {
    toast.loading("Submitting score", { id: "submitting-score" });
  }

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
      <DashboardLayout>
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner />
        </div>
      </DashboardLayout>
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
      <DashboardLayout>
        <div 
          className="flex w-full flex-col items-center justify-center gap-6 py-4 opacity-100 transition-opacity duration-600"
        >
          <h1 className="text-3xl font-semibold md:text-5xl bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent mt-24 mb-8">
            Validator Dashboard
          </h1>
          <div 
            className="flex w-full flex-col items-center justify-center gap-y-2 bg-gradient-to-b from-gray-900 to-gray-800 p-6 rounded-lg shadow-md transition-shadow duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] text-gray-200 my-8"
          >
            <span className="text-xl">
              Hey there {sessionData.user.name} 👋
            </span>
            <ul className="flex list-disc flex-col text-base text-gray-400 mt-4">
              <li>Select star rating for each team (1 to 5 stars)</li>
              <li>Ratings are automatically submitted when you click a star</li>
              <li>Submitted ratings will be highlighted in yellow</li>
            </ul>
          </div>
        </div>
        
        {/* Track Filter */}
        <div className="flex justify-end mb-4">
          <Select value={selectedTrack} onValueChange={handleTrackChange}>
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-gray-200">
              <SelectValue placeholder="Filter by track" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
              <SelectItem value="all">All Tracks</SelectItem>
              {tracks.map((track, index) => (
                <SelectItem key={index} value={track}>{track}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div 
          className="rounded-md border border-gray-700 bg-gradient-to-b from-gray-900 to-gray-800 shadow-md transition-all duration-500 mb-24"
        >
          <Table>
            <TableHeader className="bg-gray-800">
              <TableRow className="border-b border-gray-700">
                <TableHead className="text-gray-300">Sl. No.</TableHead>
                <TableHead className="text-gray-300">Team Name</TableHead>
                <TableHead className="text-gray-300">Track</TableHead>
                <TableHead className="text-gray-300">PPT</TableHead>
                <TableHead className="text-gray-300">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams
                ?.map((team, index) => {
                  const submittedScore = getTeamScore(team.id);
                  const currentRating = selectedRatings[team.id] ?? submittedScore;
                  
                  return (
                    <TableRow 
                      key={index}
                      className="hover:bg-gray-800 transition-colors duration-200 border-b border-gray-700"
                    >
                      <TableCell className="text-gray-300">{index + 1}</TableCell>
                      <TableCell className="text-gray-300">{team.name}</TableCell>
                      <TableCell className="text-gray-300">{team.IdeaSubmission?.track ?? "N/A"}</TableCell>
                      <TableCell>
                        <a
                          href={team.IdeaSubmission?.pptUrl.split(";")[0]}
                          target="_blank"
                        >
                          <div className="transition-transform duration-200 hover:scale-105 active:scale-95">
                            <Button 
                              variant="outline" 
                              className="bg-gradient-to-r from-gray-800 to-gray-700 text-gray-200 border-gray-600 hover:bg-gray-700 transition-all duration-300 hover:border-gray-500"
                            >
                              View PDF
                            </Button>
                          </div>
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleStarClick(team.id, star)}
                              className="text-3xl focus:outline-none transition-transform duration-200 hover:scale-110 active:scale-90"
                            >
                              <span className={`${currentRating >= star ? 'text-yellow-400' : 'text-gray-600'} drop-shadow-md transition-all duration-300`}>
                                ★
                              </span>
                            </button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </DashboardLayout>
    )
  );
}
