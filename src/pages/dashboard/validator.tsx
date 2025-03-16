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
import { useState } from "react";
import { FaArrowAltCircleRight } from "react-icons/fa";

export default function Validator() {
  const { data: sessionData, status } = useSession();
  const teamData = api.team.getTeamsList.useQuery();
  const { data: criteria, isLoading: criteriaLoading } = api.validator.getValidatorCriteria.useQuery();
  const [selectedRatings, setSelectedRatings] = useState<Record<string, number>>({});
  
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

  if (submitScore.isLoading) {
    toast.loading("Submitting score", { id: "submitting-score" });
  }

  // Handle star selection
  const handleStarClick = (teamId: string, rating: number) => {
    setSelectedRatings(prev => ({
      ...prev,
      [teamId]: rating
    }));
  };

  // Handle submit rating
  const handleSubmitRating = async (teamId: string) => {
    const rating = selectedRatings[teamId];
    if (!rating) return;
    
    // Convert rating to score (1 star = 3, 2 stars = 6, 3 stars = 10)
    // This ensures the maximum score is 10
    const scoreMap = {
      1: 3,
      2: 6,
      3: 10
    };
    
    const score = scoreMap[rating as 1|2|3];
    
    await submitScore.mutateAsync({
      criteriaId: criteria?.id ?? "",
      teamId: teamId,
      score: score,
    });
  };

  if (status === "loading" || criteriaLoading)
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

  type Team = {
    Scores: Array<{
      judgeId: string;
      score: number;
    }>;
  };

  // Function to get submitted score for a team
  const getTeamScore = (team: Team) => {
    if (team?.Scores[0]?.judgeId === sessionData.user.id) {
      // Convert score back to star rating
      const score = team?.Scores[0]?.score;
      if (score <= 3) return 1;
      if (score <= 6) return 2;
      return 3;
    }
    return 0;
  };

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
              <li>Select star rating for each team (1 to 3 stars)</li>
              <li>Submit your rating by clicking the arrow button</li>
              <li>Submitted ratings will be highlighted</li>
            </ul>
          </div>
        </div>
        <div 
          className="rounded-md border border-gray-700 bg-gradient-to-b from-gray-900 to-gray-800 shadow-md transition-all duration-500 mb-24"
        >
          <Table>
            <TableHeader className="bg-gray-800">
              <TableRow className="border-b border-gray-700">
                <TableHead className="text-gray-300">Sl. No.</TableHead>
                <TableHead className="text-gray-300">Team Name</TableHead>
                <TableHead className="text-gray-300">PPT</TableHead>
                <TableHead className="text-gray-300">Rating</TableHead>
                <TableHead className="text-gray-300">Submit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamData.data
                ?.filter((team) => (team.IdeaSubmission ? true : false))
                .map((team, index) => {
                  const submittedScore = getTeamScore(team);
                  const currentRating = selectedRatings[team.id] ?? submittedScore;
                  
                  return (
                    <TableRow 
                      key={index}
                      className="hover:bg-gray-800 transition-colors duration-200 border-b border-gray-700"
                    >
                      <TableCell className="text-gray-300">{index + 1}</TableCell>
                      <TableCell className="text-gray-300">{team.name}</TableCell>
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
                          {[1, 2, 3].map((star) => (
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
                      <TableCell>
                        <button
                          className={`${submittedScore > 0 ? "bg-gradient-to-r from-gray-700 to-gray-600" : "bg-gradient-to-r from-gray-800 to-gray-700"} text-white rounded-full w-10 h-10 flex items-center justify-center hover:shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-all duration-200 hover:scale-110 active:scale-90`}
                          onClick={() => handleSubmitRating(team.id)}
                        >
                          <span><FaArrowAltCircleRight /></span>
                        </button>
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
