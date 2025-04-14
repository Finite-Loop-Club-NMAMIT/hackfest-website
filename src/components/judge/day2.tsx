import { useState, useRef, useEffect } from "react"; // Added useEffect
import type { MouseEvent } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { api, type RouterOutputs } from "~/utils/api";
import Spinner from "../spinner";
import { Card, CardContent } from "../ui/card";
import { toast } from "sonner";
import { UserCircle, Info, X, Plus, Edit } from "lucide-react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { type JudgeType } from "@prisma/client";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import Tutorial from "./tutorial"; // Import the Tutorial component
import type { Step } from 'react-joyride'; // Import Step type

// Update type to reflect User as potentially an array and include id
type TeamWithRemarks = Omit<RouterOutputs["judges"]["getTeams"][number], 'Remark'> & {
   Remark?: ({
       remark: string;
       Judge: {
           type: JudgeType;
           // Include id along with name
           User: ({ id: string; name: string | null } | null)[] | null; // User is an array with id and name
       } | null;
   })[] | null;
};

const REMARK_DELIMITER = ';;;';
interface StarRatingProps {
  maxScore: number; // Maximum possible score for the criteria
  currentRating: number | undefined; // Current actual score (can be float)
  onRatingChange: (rating: number) => void;
  numberOfStars?: number; // Number of stars to display
  size?: number; 
}

const StarIcon = ({ size, color, className }: { size: number; color: string; className?: string }) => ( // Add className prop
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={color} // Use color prop
    width={size}
    height={size}
    className={`flex-shrink-0 ${className ?? ''}`} // Apply className, prevent shrinking
  >
    <path
      fillRule="evenodd"
      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354l-4.597 2.889c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z"
      clipRule="evenodd"
    />
  </svg>
);


const StarRating: React.FC<StarRatingProps> = ({
  maxScore,
  currentRating = 0,
  onRatingChange,
  numberOfStars = 5,
  size = 24, // Default size remains, will be overridden by props
}) => {
  const [hoveredStarIndex, setHoveredStarIndex] = useState<number | null>(null); // Index (0-based) of hovered star
  const containerRef = useRef<HTMLDivElement>(null);


  const getStarIndexFromX = (clientX: number): number => {
    if (!containerRef.current) return -1;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(clientX - rect.left, rect.width));

    const index = Math.min(Math.floor((relativeX / rect.width) * numberOfStars), numberOfStars - 1);
    return index;
  };


  const getScoreFromIndex = (index: number | null): number => {
    if (index === null || index < 0) return 0;
    const score = Math.round((index + 1) * (maxScore / numberOfStars));
    return Math.min(score, maxScore); 
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    setHoveredStarIndex(getStarIndexFromX(e.clientX));
  };

  const handleMouseLeave = () => {
    setHoveredStarIndex(null);
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const clickedStarIndex = getStarIndexFromX(e.clientX);
    const newScore = getScoreFromIndex(clickedStarIndex);
    const currentRoundedScore = getScoreFromIndex(getCurrentStarIndex()); // Get score based on currentRating's index

    if (newScore !== currentRoundedScore) {
       onRatingChange(newScore);
    }
  };

  const getCurrentStarIndex = (): number | null => {
      if (currentRating <= 0) return null;

      let closestIndex = 0;
      let minDiff = Math.abs(getScoreFromIndex(0) - currentRating);
      for (let i = 1; i < numberOfStars; i++) {
          const scoreAtIndex = getScoreFromIndex(i);
          const diff = Math.abs(scoreAtIndex - currentRating);
          if (diff < minDiff) {
              minDiff = diff;
              closestIndex = i;
          }

          else if (diff === minDiff && scoreAtIndex < getScoreFromIndex(closestIndex)) {
             closestIndex = i;
          }
      }

       const scoreThreshold = (maxScore / numberOfStars) / 2;
       if (minDiff > scoreThreshold) {

       }

      return closestIndex;
  };


  const currentStarIndex = getCurrentStarIndex();
  const displayStarIndex = hoveredStarIndex ?? currentStarIndex;

  const fillPercentage = displayStarIndex !== null ? ((displayStarIndex + 1) / numberOfStars) * 100 : 0;

  const textDisplayScore = getScoreFromIndex(displayStarIndex);
  const currentTextScore = getScoreFromIndex(currentStarIndex); 

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
           <div
             ref={containerRef}
             // Add relative positioning for the score text on mobile
             className="relative inline-flex cursor-pointer"
             onMouseMove={handleMouseMove}
             onMouseLeave={handleMouseLeave}
             onClick={handleClick}
             role="slider"
             aria-valuenow={currentTextScore} 
             aria-valuemin={0}
             aria-valuemax={maxScore}
             aria-label={`Rating: ${currentTextScore} out of ${maxScore}`} 
           >
              {/* Background Stars (Empty) */}
              <div className="flex" aria-hidden="true">
                {[...Array(numberOfStars)].map((_, index) => (
                  <StarIcon key={`bg-${index}`} size={size} color="currentColor" className="text-gray-300" /> // Pass className
                ))}
              </div>

              <div
                className="absolute top-0 left-0 h-full overflow-hidden flex"
                style={{ width: `${fillPercentage}%` }} 
                aria-hidden="true"
              >
                {[...Array(numberOfStars)].map((_, index) => (
                   <StarIcon key={`fg-${index}`} size={size} color="currentColor" className="text-yellow-400" /> // Pass className
                ))}
              </div>
              {/* Adjust score text position for mobile */}
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-semibold text-foreground w-16 text-center md:text-sm md:w-10 md:-right-12 md:top-1/2 md:left-auto md:-translate-y-1/2 md:translate-x-0">
                {textDisplayScore} / {maxScore}
              </span>
           </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click or hover to rate (Score: {textDisplayScore} / {maxScore})</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};


export default function DAY2() {
  const { data: session } = useSession();
  const teamsQuery = api.judges.getTeams.useQuery();
  const teams = teamsQuery.data as TeamWithRemarks[] | undefined;
  const judgeInfoQuery = api.judges.getDay.useQuery(undefined, { // Fetch judge info including tutorial status
      enabled: !!session?.user, // Only run if user is logged in
  });
  const judgeType = judgeInfoQuery.data?.type;

  // Fetch criteria based on the judge's type, only if the type is for Day 2
  const criteriasQuery = api.judges.getCriterias.useQuery(
    {
      judgeType: judgeType as "DAY2_ROUND1" | "DAY2_ROUND2",
    },
    {
      enabled: !!judgeType && (judgeType === "DAY2_ROUND1" || judgeType === "DAY2_ROUND2"),
    },
  );
  const criterias = criteriasQuery.data;

  const updateScore = api.judges.setScore.useMutation({
     onSuccess: async () => {
       await teamsQuery.refetch();
       toast.success("Score saved successfully");
     },
     onError: (error) => {
        toast.error(`Failed to save score: ${error.message}`);
     }
  });

  const addRemarkMutation = api.remark.addRemark.useMutation({
    onSuccess: async () => {
      await teamsQuery.refetch();
      toast.success("Remarks saved successfully");
      setIsRemarkModalOpen(false);
    },
    onError: (error) => {
       toast.error(`Failed to save remarks: ${error.message}`);
    },
  });

  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState<string | null>(null);
  const [editingRemarks, setEditingRemarks] = useState<string[]>(['']);

  const [showTutorial, setShowTutorial] = useState(false); // State to control tutorial visibility

  const markTutorialMutation = api.judges.markTutorialAsShown.useMutation({ // Mutation to mark tutorial as shown
      onSuccess: () => {
          void judgeInfoQuery.refetch(); // Refetch judge info to update status
          toast.success("Tutorial completed!");
      },
      onError: (error) => {
          toast.error(`Failed to save tutorial status: ${error.message}`);
      }
  });

  const isLoading = teamsQuery.isLoading || judgeInfoQuery.isLoading || criteriasQuery.isLoading;
  const isError = teamsQuery.isError || judgeInfoQuery.isError || criteriasQuery.isError;
  const errorMessage = teamsQuery.error?.message ?? judgeInfoQuery.error?.message ?? criteriasQuery.error?.message;

  // Effect to show tutorial if not shown before
  useEffect(() => {
      if (judgeInfoQuery.isSuccess && judgeInfoQuery.data && !judgeInfoQuery.data.tutorialShown) {
          // Add a small delay to ensure the page elements are rendered
          const timer = setTimeout(() => setShowTutorial(true), 500);
          return () => clearTimeout(timer);
      }
  }, [judgeInfoQuery.isSuccess, judgeInfoQuery.data]);

  // Functions to manage remarks in the modal
  const handleAddPoint = () => {
    setEditingRemarks([...editingRemarks, '']);
  };

  const handleRemovePoint = (index: number) => {
    if (editingRemarks.length > 1) {
      const newRemarks = [...editingRemarks];
      newRemarks.splice(index, 1);
      setEditingRemarks(newRemarks);
    } else {
      setEditingRemarks(['']); // Reset to one empty point
    }
  };

  const handleRemarkChange = (index: number, value: string) => {
    const newRemarks = [...editingRemarks];
    newRemarks[index] = value;
  };

  // Function to open the modal and set initial state
  const openRemarkModal = (team: TeamWithRemarks) => {
    const judgeId = session?.user?.id; // This should be the User ID from the session

    if (!judgeId) {
      toast.error("Could not open remarks modal: User session not found.");
      return;
    }

    // Find the remark entry specifically for the current judge (User)
    const remarkEntry = team.Remark?.find(r => {
      const userMatch = r.Judge?.User?.some(u => {
        return u?.id === judgeId;
      });
      return userMatch;
    });

    const existingRemarkString = remarkEntry?.remark;

    let initialRemarks: string[];
    if (existingRemarkString && existingRemarkString.trim() !== '') {
      initialRemarks = existingRemarkString.split(REMARK_DELIMITER).filter(p => p.trim() !== '');
      if (initialRemarks.length === 0) {
        initialRemarks = [''];
      }
    } else {
      initialRemarks = [''];
    }
    setEditingTeamId(team.id);
    setEditingTeamName(`Team ${team.teamNo}: ${team.name}`);
    setEditingRemarks(initialRemarks);
    setIsRemarkModalOpen(true);
  };

  // Function to save remarks
  const handleSaveRemarks = () => {
    const judgeId = session?.user?.id;
    if (!judgeId || !editingTeamId) {
      toast.error("Could not save remarks. User or Team ID missing.");
      return;
    }

    const remarkString = editingRemarks.filter(point => point.trim() !== '').join(REMARK_DELIMITER);

    addRemarkMutation.mutate({
      teamId: editingTeamId,
      judgeId: judgeId,
      remark: remarkString,
    });
  };

  const handleTutorialComplete = () => {
      setShowTutorial(false);
      markTutorialMutation.mutate(); // Call mutation to update DB
  };

  // Define tutorial steps for Day 2
  const day2TutorialSteps: Step[] = [
      {
          target: '.carousel-container', // Use a class or ID for the main container
          content: 'Welcome to the Day 2 Scoring Dashboard! Navigate between teams using arrows or swipe.',
          placement: 'center',
          disableBeacon: true,
      },
      {
          target: '.team-info-header', // Add class to team info section
          content: 'Team details are displayed here.',
          placement: 'bottom',
      },
      {
          target: '.scoring-section', // Add class to scoring section
          content: 'Rate the team on each criterion using the star rating system. Hover or click to set a score.',
          placement: 'right',
      },
      {
          target: '.star-rating-example', // Add class to the first star rating component
          content: 'Click or hover over the stars to assign a score for this criterion. Scores are saved automatically.',
          placement: 'bottom',
      },
      {
          target: '.remarks-section', // Add class to remarks section
          content: 'View remarks from all judges here. You can add or edit your own remarks.',
          placement: 'left',
      },
      {
          target: '.edit-remarks-button', // Add class to the edit remarks button
          content: 'Click this button to open a modal where you can add or edit your remarks for this team.',
          placement: 'left',
      },
      {
          target: '.carousel-navigation-prev', // Add class to prev button
          content: 'Go to the previous team.',
          placement: 'right',
      },
      {
          target: '.carousel-navigation-next', // Add class to next button
          content: 'Go to the next team.',
          placement: 'left',
      },
      {
          target: 'body',
          content: "You're all set to start scoring and remarking!",
          placement: 'center',
      },
  ];

  return (
    <>
      {/* Add Tutorial Component */}
      <Tutorial run={showTutorial} steps={day2TutorialSteps} onComplete={handleTutorialComplete} />

      {/* Loading and Error States */}
      {isLoading && (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
          <Spinner size="large" />
        </div>
      )}
       {isError && (
            <div className="flex h-screen w-screen items-center justify-center bg-background p-6 text-center">
               <p className="text-xl text-destructive">Error loading data: {errorMessage}</p>
           </div>
       )}

      {/* Main Content */}
      {!isLoading && !isError && teams && teams.length > 0 && criterias && criterias.length > 0 && (
        // Add class for tutorial target
        <div className="carousel-container flex w-full items-center justify-center px-2 py-4 md:px-6 md:py-10">
          {/* Adjust max-width for mobile, keep md+ as is */}
          {/* Reduce height */}
          <Carousel className="m-auto flex h-[85vh] w-full max-w-full items-center justify-center md:max-w-7xl" >
            <CarouselContent>
              {teams.map((team, _index) => {
                 const allRemarks = team.Remark ?? [];
                 const judgeId = session?.user?.id;
                 // Find remark by the current judge
                 // Access user id safely now
                 const currentJudgeRemark = judgeId ? allRemarks.find(r => r.Judge?.User?.some(u => u?.id === judgeId)) : undefined;
                 const currentJudgeRemarkPoints = currentJudgeRemark?.remark ? currentJudgeRemark.remark.split(REMARK_DELIMITER).filter(p => p.trim() !== '') : [];

                return (
                  <CarouselItem key={team.id}>
                    {/* Adjust height slightly for mobile */}
                    {/* Reduce height */}
                    <Card className="h-[80vh] overflow-hidden rounded-xl bg-card shadow-lg md:h-[80vh]">
                      {/* Adjust padding for mobile */}
                      <CardContent className="flex h-full flex-col items-center justify-start p-4 md:p-6 lg:p-10">

                        {/* Add class for tutorial target */}
                        <div className="team-info-header mb-4 flex w-full flex-col items-center justify-center gap-3 pb-4 md:mb-8 md:gap-5 md:pb-8">
                          {/* Team Info Section */}
                          {/* Adjust margin/padding/gap for mobile */}
                          <div className="mb-4 flex w-full flex-col items-center justify-center gap-3 pb-4 md:mb-8 md:gap-5 md:pb-8">
                            {/* Top Row: Team Name, Track */}
                            <div className="flex w-full flex-col items-center gap-2 md:flex-row md:items-start md:justify-between md:gap-4">
                              {/* Left: Team Name and Number */}
                              <div className="flex w-full flex-col items-center text-center md:w-auto md:items-start md:text-left">
                                {/* Adjust font size for mobile */}
                                <h1 className="w-full truncate text-center text-2xl font-bold text-foreground md:text-left md:text-4xl lg:text-6xl">
                                  {team.name}
                                </h1>
                                {/* Adjust font size for mobile */}
                                <span className="mt-1 text-sm font-medium text-primary md:mt-1.5 md:text-lg">Team #{team.teamNo}</span>
                              </div>
                              {/* Right: Track */}
                              <div className="flex flex-col items-center gap-2 flex-shrink-0 md:items-end">
                                <TooltipProvider delayDuration={100}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      {/* Adjust font size and padding for mobile */}
                                      <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground md:px-4 md:py-1.5 md:text-base">
                                        <Info className="h-3 w-3 md:h-5 md:w-5" />
                                        {/* Shorten "Track:" on mobile */}
                                        <span className="hidden sm:inline">Track:</span> {team.IdeaSubmission?.track.replace(/_/g, ' ') ?? 'N/A'}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>The track this team submitted their idea under.</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>

                            {/* Bottom Row: Team Members */}
                            {/* Adjust gap and padding for mobile */}
                            <div className="flex w-full flex-wrap items-start justify-center gap-x-3 gap-y-2 pt-3 md:gap-x-6 md:pt-5">
                                {team.Members.map((member) => (
                                  // Adjust width and image size for mobile
                                  <div key={member.name} className="flex w-16 flex-col items-center text-center md:w-24">
                                    {member.image ? (
                                      <Image
                                        src={member.image}
                                        alt={member.name ?? 'Member'}
                                        width={40} // Smaller size for mobile
                                        height={40} // Smaller size for mobile
                                        className="rounded-full object-cover ring-2 ring-offset-2 ring-offset-card ring-border transition-transform duration-200 hover:scale-110 hover:ring-primary md:h-14 md:w-14"
                                      />
                                    ) : (
                                      <UserCircle className="h-10 w-10 text-muted-foreground transition-colors duration-200 hover:text-primary md:h-14 md:w-14" /> // Smaller size for mobile
                                    )}
                                    {/* Adjust font size for mobile */}
                                    <span className="mt-1 w-full text-[10px] text-muted-foreground md:mt-2 md:text-sm">{member.name}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>

                        {/* Scoring and Remarks Container */}
                        {/* Stack vertically on mobile, grid on md+ */}
                        {/* Removed overflow-hidden */}
                        <div className="grid h-full w-full flex-grow grid-cols-1 gap-x-0 gap-y-4 pt-2 md:grid-cols-2 md:gap-x-8 md:gap-y-6 md:pt-4">

                          {/* Add class for tutorial target */}
                          {/* Removed overflow-hidden, max-h-*, h-full */}
                          <div className="scoring-section flex w-full flex-col items-center justify-start md:h-auto">
                            <h3 className="mb-3 text-xl font-semibold text-foreground md:mb-6 md:text-3xl lg:text-4xl">Score Criteria</h3>
                            {/* Removed flex-grow, overflow-y-auto */}
                            <div className="w-full space-y-4 rounded-lg border border-border bg-background/50 p-2 pr-3 shadow-inner md:space-y-5 md:p-4 md:pr-5">
                              {criterias.map((criteria, criteriaIndex) => { // Add index
                                const currentScore = team.Scores?.find(
                                  (score) => score.criteriaId === criteria.id,
                                )?.score;
                                const maxScoreForCriteria = criteria.maxScore ?? 10;

                                return (
                                  <div
                                    className="grid grid-cols-5 items-center gap-2 rounded-md p-1.5 transition-colors hover:bg-muted/50 md:grid-cols-3 md:gap-4 md:p-3"
                                    key={criteria.id}
                                  >
                                    <span className="col-span-3 text-sm font-medium text-foreground md:col-span-2 md:text-lg">{criteria.criteria} <span className="hidden text-xs text-muted-foreground md:inline md:text-sm"> (Max: {maxScoreForCriteria})</span></span>
                                    {/* Add class for tutorial target (only to the first one) */}
                                    <div className={`col-span-2 flex justify-end pr-0 relative pb-3 md:col-span-1 md:pr-10 md:pb-0 ${criteriaIndex === 0 ? 'star-rating-example' : ''}`}>
                                       <StarRating
                                          maxScore={maxScoreForCriteria}
                                          currentRating={currentScore}
                                          onRatingChange={(newRating) => {
                                              updateScore.mutate({
                                                  teamId: team.id,
                                                  criteriaId: criteria.id,
                                                  score: newRating,
                                              });
                                          }}
                                          numberOfStars={5}
                                          // Adjust star size for mobile
                                          size={20} // Smaller size for mobile
                                          // size={28} // Original size for md+ (implicitly handled by default prop value if not overridden, but explicit is clearer)
                                       />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Add class for tutorial target */}
                          {/* Removed overflow-hidden, max-h-*, h-full */}
                          <div className="remarks-section flex w-full flex-col items-center justify-start md:h-auto">
                             <div className="mb-3 flex w-full items-center justify-between md:mb-6">
                                <h3 className="text-xl font-semibold text-foreground md:text-3xl lg:text-4xl">Judge Remarks</h3>
                                {/* Add class for tutorial target */}
                                {(judgeType === "DAY2_ROUND1" || judgeType === "DAY2_ROUND2") && (
                                    <Button variant="outline" size="sm" onClick={() => openRemarkModal(team)} className="edit-remarks-button md:size-sm">
                                        <Edit className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
                                        {currentJudgeRemarkPoints.length > 0 ? "Edit" : "Add"} <span className="hidden md:inline ml-1">Remarks</span>
                                    </Button>
                                )}
                             </div>
                             {/* Adjust padding for mobile */}
                             {/* Removed flex-grow, overflow-y-auto */}
                             <div className="w-full space-y-3 rounded-lg border border-border bg-background/50 p-2 shadow-inner md:space-y-4 md:p-4">
                               {allRemarks.length > 0 ? (
                                 allRemarks.map((remarkEntry, remarkIdx) => {
                                   const remarkPoints = remarkEntry.remark ? remarkEntry.remark.split(REMARK_DELIMITER).filter(point => point.trim() !== '') : [];
                                   const judgeName = remarkEntry.Judge?.User?.[0]?.name ?? `Unknown Judge (${remarkEntry.Judge?.type ?? 'N/A'})`;
                                   // Access user id safely now
                                   const isCurrentUser = remarkEntry.Judge?.User?.some(u => u?.id === judgeId); // Check if it's the current user's remark

                                   if (remarkPoints.length === 0) return null;

                                   return (
                                     // Adjust padding for mobile
                                     <div key={remarkIdx} className={`mb-2 rounded-md p-2 ${isCurrentUser ? 'bg-primary/10 border border-primary/30' : ''} md:mb-3 md:p-3`}>
                                       {/* Adjust font size for mobile */}
                                       <p className={`mb-1 text-xs font-semibold ${isCurrentUser ? 'text-primary' : 'text-muted-foreground'} md:mb-2 md:text-sm`}>
                                         {isCurrentUser ? "Your Remarks:" : `${judgeName}'s Remarks:`}
                                       </p>
                                       {/* Adjust font size and padding for mobile */}
                                       <ul className="list-disc space-y-0.5 pl-4 text-sm text-muted-foreground md:space-y-1 md:pl-5 md:text-base">
                                         {remarkPoints.map((point, pointIdx) => (
                                           <li key={`${remarkIdx}-${pointIdx}`}>{point}</li>
                                         ))}
                                       </ul>
                                     </div>
                                   );
                                 })
                               ) : (
                                 // Adjust font size for mobile
                                 <p className="flex h-full items-center justify-center text-center text-sm text-muted-foreground md:text-base">
                                   No remarks were found for this team.
                                 </p>
                               )}
                               {/* Handle case where remarks exist but all points are empty */}
                               {allRemarks.length > 0 && allRemarks.every(r => !r.remark || r.remark.split(REMARK_DELIMITER).every(p => p.trim() === '')) && (
                                  // Adjust font size for mobile
                                  <p className="flex h-full items-center justify-center text-center text-sm text-muted-foreground md:text-base">
                                      No remarks were found for this team.
                                  </p>
                               )}
                             </div>
                          </div>

                        </div> {/* End Scoring and Remarks Container */}
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            {/* Add classes for tutorial targets */}
            <CarouselPrevious className="carousel-navigation-prev absolute left-1 top-1/2 -translate-y-1/2 h-10 w-10 p-1 text-foreground hover:bg-muted hover:text-foreground hidden md:inline-flex md:left-[-70px] md:h-16 md:w-16 md:p-2" />
            <CarouselNext className="carousel-navigation-next absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-1 text-foreground hover:bg-muted hover:text-foreground hidden md:inline-flex md:right-[-70px] md:h-16 md:w-16 md:p-2" />
          </Carousel>
        </div>
      )}

       {/* No Teams/Criteria Messages */}
       {!isLoading && !isError && (!teams || teams.length === 0) && (
           <div className="flex h-screen w-screen items-center justify-center p-6">
               <p className="text-xl text-gray-500">No teams available for scoring at this stage.</p>
           </div>
       )}
       {!isLoading && !isError && (!criterias || criterias.length === 0) && judgeType && (
            <div className="flex h-screen w-screen items-center justify-center bg-background p-6 text-center">
               <p className="text-xl text-muted-foreground">No scoring criteria found for your assigned round ({judgeType}).</p>
           </div>
       )}

       {/* Remark Edit Modal - Adjust max-width and internal padding/font sizes for mobile */}
       <Dialog open={isRemarkModalOpen} onOpenChange={setIsRemarkModalOpen}>
         {/* Adjust max-width for mobile */}
         <DialogContent className="max-w-[90vw] sm:max-w-[600px]">
           <DialogHeader>
             {/* Adjust font size for mobile */}
             <DialogTitle className="text-lg md:text-xl">Add/Edit Remarks</DialogTitle>
             <DialogDescription className="text-sm md:text-base">
               {editingTeamName ?? "Selected Team"}
             </DialogDescription>
           </DialogHeader>
           {/* Adjust height and padding for mobile */}
           <div className="flex h-[60vh] flex-col space-y-3 py-3 md:h-[400px] md:space-y-4 md:py-4">
             {/* Adjust padding for mobile */}
             <div className="flex-grow space-y-2 overflow-y-auto rounded-md border bg-background/50 p-2 pr-3 shadow-inner md:space-y-3 md:p-3 md:pr-4">
               {editingRemarks.map((point, pointIndex) => (
                 // Adjust gap for mobile
                 <div key={pointIndex} className="flex items-center gap-2 md:gap-3">
                   {/* Adjust size for mobile */}
                   <span className="text-lg font-semibold text-primary md:text-xl">•</span>
                   <Input
                     type="text"
                     value={point}
                     onChange={(e) => handleRemarkChange(pointIndex, e.target.value)}
                     placeholder="Enter remark point..."
                     // Adjust font size for mobile
                     className="flex-grow rounded-md border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary md:text-base"
                   />
                   <Button
                     variant="ghost"
                     size="icon"
                     onClick={() => handleRemovePoint(pointIndex)}
                     disabled={editingRemarks.length <= 1}
                     // Adjust size for mobile
                     className="h-6 w-6 text-destructive hover:bg-destructive/10 disabled:opacity-50 md:h-7 md:w-7"
                   >
                     <X className="h-3 w-3 md:h-4 md:w-4" />
                   </Button>
                 </div>
               ))}
             </div>
             {/* Adjust button size for mobile */}
             <Button onClick={handleAddPoint} variant="outline" size="sm" className="mt-2 self-start border-dashed border-primary text-primary hover:bg-primary/10 hover:text-primary">
               <Plus className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" /> Add Point
             </Button>
           </div>
           <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2"> {/* Stack buttons on small screens */}
             <DialogClose asChild>
               {/* Adjust button size for mobile */}
               <Button type="button" variant="secondary" size="sm" className="w-full sm:w-auto">
                 Cancel
               </Button>
             </DialogClose>
             <Button
                type="button"
                onClick={handleSaveRemarks}
                disabled={addRemarkMutation.isLoading}
                size="sm" // Adjust button size for mobile
                className="w-full sm:w-auto"
             >
               {addRemarkMutation.isLoading ? <Spinner size="small" /> : "Save Remarks"}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
    </>
  );
}
