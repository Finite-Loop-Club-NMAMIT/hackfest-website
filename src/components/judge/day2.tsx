import { useState, useEffect, useMemo } from "react";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { api, type RouterOutputs } from "~/utils/api";
import Spinner from "../spinner";
import { Card, CardContent } from "../ui/card";
import { toast } from "sonner";
import { UserCircle, Info, X, Plus, Edit, Search } from "lucide-react";
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
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import Tutorial from "./tutorial";
import type { Step } from 'react-joyride';

type TeamWithRemarks = Omit<RouterOutputs["judges"]["getTeams"][number], 'Remark'> & {
   Remark?: ({
       remark: string;
       Judge: {
           type: JudgeType;
           User: ({ id: string; name: string | null } | null)[] | null;
       } | null;
   })[] | null;
};

const REMARK_DELIMITER = ';;;';

const MAX_SCORE = 10;

interface NumericRatingProps {
  currentRating: number | undefined;
  onRatingChange: (rating: number) => void;
  max?: number;
}

const NumericRating: React.FC<NumericRatingProps> = ({
  currentRating = 0,
  onRatingChange,
  max = MAX_SCORE,
}) => {
  const [inputValue, setInputValue] = useState(currentRating?.toString() || "");
  const [isFocused, setIsFocused] = useState(false);

  // Update local state when prop changes (like when data is refetched)
  useEffect(() => {
    if (!isFocused && currentRating !== undefined) {
      setInputValue(currentRating.toString());
    }
  }, [currentRating, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow empty string, valid numbers, and numbers with one decimal place
    const value = e.target.value;
    const regex = /^$|^([1-9]|10)(\.\d{0,1})?$|^0?\.\d{0,1}$/;
    
    if (regex.test(value) || value === "10") {
      setInputValue(value);
    }
  };

  const handleSubmit = () => {
    let finalValue = parseFloat(inputValue);

    // If empty or invalid, set to 0
    if (isNaN(finalValue) || inputValue === "") {
      finalValue = 0;
      setInputValue("0");
    }
    // Ensure the value is within range
    else if (finalValue < 0) {
      finalValue = 0;
      setInputValue("0");
    } 
    else if (finalValue > max) {
      finalValue = max;
      setInputValue(max.toString());
    }
    
    // Round to one decimal place
    finalValue = Math.round(finalValue * 10) / 10;
    if (finalValue !== currentRating) {
      onRatingChange(finalValue);
    }
    
    // Format to always show one decimal place
    setInputValue(finalValue.toFixed(1));
  };

  const handleBlur = () => {
    setIsFocused(false);
    handleSubmit();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative inline-flex">
            <div className="flex items-center">
              <Input
                type="text"
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                className="w-16 text-center p-1 h-8 text-foreground font-medium"
                inputMode="decimal"
                aria-valuenow={currentRating ?? 0}
                aria-valuemin={0}
                aria-valuemax={MAX_SCORE}
                aria-label={`Rating: ${currentRating ?? 0} out of ${MAX_SCORE}`}
              />
              <span className="ml-1 text-sm font-medium text-muted-foreground">/ {max}</span>
              <Button 
                size="sm" 
                variant="outline" 
                className="ml-2 h-8 px-2 py-0" 
                onClick={handleSubmit}
                aria-label="Submit score"
              >
                Submit
              </Button>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Enter a score from 0 to {max} (decimals allowed)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default function DAY2() {
  const { data: session } = useSession();
  const teamsQuery = api.judges.getTeams.useQuery();
  const teams = teamsQuery.data as TeamWithRemarks[] | undefined;
  const judgeInfoQuery = api.judges.getDay.useQuery(undefined, {
      enabled: !!session?.user,
  });
  const judgeType = judgeInfoQuery.data?.type;

  // Add search and filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTrack, setSelectedTrack] = useState<string>("all");

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

  const [showTutorial, setShowTutorial] = useState(false);

  const markTutorialMutation = api.judges.markTutorialAsShown.useMutation({
      onSuccess: () => {
          void judgeInfoQuery.refetch();
          toast.success("Tutorial completed!");
      },
      onError: (error) => {
          toast.error(`Failed to save tutorial status: ${error.message}`);
      }
  });

  // Fix the TypeScript error by using the proper type for CarouselApi
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  const isLoading = teamsQuery.isLoading || judgeInfoQuery.isLoading || criteriasQuery.isLoading;
  const isError = teamsQuery.isError || judgeInfoQuery.isError || criteriasQuery.isError;
  const errorMessage = teamsQuery.error?.message ?? judgeInfoQuery.error?.message ?? criteriasQuery.error?.message;

  // Filter teams based on search query and track
  const filteredTeams = useMemo(() => {
    if (!teams) return [];
    
    let filtered = teams;
    
    // Filter by track if not "all"
    if (selectedTrack !== "all") {
      filtered = filtered.filter(team => 
        team.IdeaSubmission?.track === selectedTrack
      );
    }
    
    // Filter by team name or team number
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.teamNo.toString().includes(searchQuery.trim())
      );
    }
    
    return filtered;
  }, [teams, selectedTrack, searchQuery]);

  // Get unique tracks for the filter dropdown
  const uniqueTracks = useMemo(() => {
    const tracks = new Set<string>();
    tracks.add("all");
    (teams ?? []).forEach(team => {
      if (team.IdeaSubmission?.track) {
        tracks.add(team.IdeaSubmission.track);
      }
    });
    return Array.from(tracks);
  }, [teams]);

  useEffect(() => {
      if (judgeInfoQuery.isSuccess && judgeInfoQuery.data && !judgeInfoQuery.data.tutorialShown) {
          const timer = setTimeout(() => setShowTutorial(true), 500);
          return () => clearTimeout(timer);
      }
  }, [judgeInfoQuery.isSuccess, judgeInfoQuery.data]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!carouselApi) return;
      
      if (e.key === "ArrowLeft") {
        carouselApi.scrollPrev();
      } else if (e.key === "ArrowRight") {
        carouselApi.scrollNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [carouselApi]);

  const handleAddPoint = () => {
    setEditingRemarks([...editingRemarks, '']);
  };

  const handleRemovePoint = (index: number) => {
    if (editingRemarks.length > 1) {
      const newRemarks = [...editingRemarks];
      newRemarks.splice(index, 1);
      setEditingRemarks(newRemarks);
    } else {
      setEditingRemarks(['']);
    }
  };

  const handleRemarkChange = (index: number, value: string) => {
    const newRemarks = [...editingRemarks];
    newRemarks[index] = value;
    setEditingRemarks(newRemarks);
  };

  const openRemarkModal = (team: TeamWithRemarks) => {
    const judgeId = session?.user?.id;

    if (!judgeId) {
      toast.error("Could not open remarks modal: User session not found.");
      return;
    }

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
      markTutorialMutation.mutate();
  };

  // Handle search button click
  const handleSearch = () => {
    if (carouselApi && filteredTeams.length > 0) {
      const index = filteredTeams.findIndex(team =>
          team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          team.teamNo.toString().includes(searchQuery.trim())
      );

      if (index !== -1) {
          carouselApi.scrollTo(index);
      } else if (searchQuery.trim() !== "") {
          toast.info(`No team matching "${searchQuery}" found in the current filter.`);
      }
    }
  };

  // Update tutorial steps to include the new search and filter UI
  const day2TutorialSteps: Step[] = [
    {
      target: 'body',
      content: 'Welcome to the Day 2 Judging Dashboard! Let\'s walk through the scoring process.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.search-filter-controls',
      content: 'Use these controls to search for teams by name or number, and filter by track.',
      placement: 'bottom',
    },
    {
      target: '.carousel-container',
      content: 'Navigate between teams using the left and right arrow keys.',
      placement: 'center',
    },
    {
      target: '.edit-remarks-button',
      content: 'Click here to add or edit your remarks about this team.',
      placement: 'bottom',
    },
    {
      target: '.numeric-rating-example',
      content: 'Enter a score from 0 to 10 for each criteria. You can use decimal values like 7.5. Click Submit to save your score.',
      placement: 'bottom',
    },
    {
      target: '.carousel-navigation-next',
      content: 'Use these buttons or arrow keys to move between teams.',
      placement: 'left',
    },
    {
      target: 'body',
      content: 'You\'re ready to start scoring! Rate each team and provide comments to explain your scores.',
      placement: 'center',
    }
  ];

  return (
    <>
      <Tutorial 
        run={showTutorial} 
        steps={day2TutorialSteps} 
        onComplete={handleTutorialComplete}
      />

      {isLoading && (
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner size="large" />
        </div>
      )}
      {isError && (
        <div className="flex w-screen items-center justify-center p-6 text-center">
          <p className="text-xl text-destructive">Error loading data: {errorMessage}</p>
        </div>
      )}

      {!isLoading && !isError && teams && teams.length > 0 && criterias && criterias.length > 0 && (
        <div className="flex w-full flex-col items-center justify-center px-2 py-4 md:px-6 md:py-10 overflow-hidden bg-background">
          {/* Search and Filter Controls */}
          <div className="search-filter-controls mb-4 flex w-full max-w-full flex-col items-center gap-3 px-2 md:max-w-4xl md:flex-row md:gap-4">
            <div className="flex w-full flex-col gap-1 md:w-2/3">
              <Label htmlFor="search-team" className="text-xs font-medium text-muted-foreground">Search Team Name or Number</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="search-team"
                  type="text"
                  placeholder="Enter team name or number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow"
                />
                <Button onClick={handleSearch} size="icon" variant="outline" aria-label="Search" className="search-button">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex w-full flex-col gap-1 md:w-1/3">
              <Label htmlFor="track-filter" className="text-xs font-medium text-muted-foreground">Filter by Track</Label>
              <Select
                value={selectedTrack}
                onValueChange={(value) => setSelectedTrack(value)}
              >
                <SelectTrigger id="track-filter" className="flex-grow">
                  <SelectValue placeholder="Select Track" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tracks</SelectItem>
                  {uniqueTracks.filter(track => track !== "all").map(track => (
                    <SelectItem key={track} value={track}>
                      {track.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredTeams.length > 0 ? (
            <div className="carousel-container flex w-full items-center justify-center overflow-hidden">
              <Carousel 
                className="m-auto flex w-full max-w-full items-center justify-center md:max-w-7xl" 
                setApi={setCarouselApi}
                opts={{
                  align: "center",
                  containScroll: "trimSnaps",
                }}
              >
                <CarouselContent className="overflow-visible">
                  {filteredTeams.map((team, _index) => {
                     const allRemarks = team.Remark ?? [];
                     const judgeId = session?.user?.id;
                     const currentJudgeRemark = judgeId ? allRemarks.find(r => r.Judge?.User?.some(u => u?.id === judgeId)) : undefined;
                     const currentJudgeRemarkPoints = currentJudgeRemark?.remark ? currentJudgeRemark.remark.split(REMARK_DELIMITER).filter(p => p.trim() !== '') : [];

                    return (
                      <CarouselItem key={team.id}>
                        <Card className="rounded-xl shadow-lg overflow-visible">
                          <CardContent className="flex flex-col items-center justify-start p-4 md:p-6 lg:p-10 overflow-visible">
                            <div className="team-info-header mb-4 flex w-full flex-col items-center justify-center gap-3 pb-4 md:mb-8 md:gap-5 md:pb-8">
                              <div className="mb-4 flex w-full flex-col items-center justify-center gap-3 pb-4 md:mb-8 md:gap-5 md:pb-8">
                                <div className="flex w-full flex-col items-center gap-2 md:flex-row md:items-start md:justify-between md:gap-4">
                                  <div className="flex w-full flex-col items-center text-center md:w-auto md:items-start md:text-left">
                                    <h1 className="w-full truncate text-center text-2xl font-bold text-foreground md:text-left md:text-4xl lg:text-6xl">
                                      {team.name}
                                    </h1>
                                    <span className="mt-1 text-sm font-medium text-primary md:mt-1.5 md:text-lg">Team #{team.teamNo}</span>
                                  </div>
                                  <div className="flex flex-col items-center gap-2 flex-shrink-0 md:items-end">
                                    <TooltipProvider delayDuration={100}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground md:px-4 md:py-1.5 md:text-base">
                                            <Info className="h-3 w-3 md:h-5 md:w-5" />
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

                                <div className="flex w-full flex-wrap items-start justify-center gap-x-3 gap-y-2 pt-3 md:gap-x-6 md:pt-5">
                                    {team.Members.map((member) => (
                                      <div key={member.name} className="flex w-16 flex-col items-center text-center md:w-24">
                                        {member.image ? (
                                          <Image
                                            src={member.image}
                                            alt={member.name ?? 'Member'}
                                            width={40}
                                            height={40}
                                            className="rounded-full object-cover ring-2 ring-offset-2 ring-offset-card ring-border transition-transform duration-200 hover:scale-110 hover:ring-primary md:h-14 md:w-14"
                                          />
                                        ) : (
                                          <UserCircle className="h-10 w-10 text-muted-foreground transition-colors duration-200 hover:text-primary md:h-14 md:w-14" />
                                        )}
                                        <span className="mt-1 w-full text-[10px] text-muted-foreground md:mt-2 md:text-sm">{member.name}</span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </div>

                            <div className="flex w-full flex-grow flex-col gap-y-4 pt-2 md:gap-y-6 md:pt-4">
                              <div className="remarks-section flex w-full flex-col items-center justify-start">
                                 <div className="mb-3 flex w-full items-center justify-between md:mb-6">
                                    <h3 className="text-xl font-semibold text-foreground md:text-3xl lg:text-4xl">Judge Remarks</h3>
                                    {(judgeType === "DAY2_ROUND1" || judgeType === "DAY2_ROUND2") && (
                                        <Button variant="outline" size="sm" onClick={() => openRemarkModal(team)} className="edit-remarks-button md:size-sm">
                                            <Edit className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
                                            {currentJudgeRemarkPoints.length > 0 ? "Edit" : "Add"} <span className="hidden md:inline ml-1">Remarks</span>
                                        </Button>
                                    )}
                                 </div>
                                 <div className="w-full flex-grow space-y-3 overflow-y-auto rounded-lg border border-border p-2 shadow-inner md:space-y-4 md:p-4">
                                   {allRemarks.length > 0 ? (
                                     allRemarks.map((remarkEntry, remarkIdx) => {
                                       const remarkPoints = remarkEntry.remark ? remarkEntry.remark.split(REMARK_DELIMITER).filter(point => point.trim() !== '') : [];
                                       const judgeName = remarkEntry.Judge?.User?.[0]?.name ?? `Unknown Judge (${remarkEntry.Judge?.type ?? 'N/A'})`;
                                       const isCurrentUser = remarkEntry.Judge?.User?.some(u => u?.id === judgeId);

                                       if (remarkPoints.length === 0) return null;

                                       return (
                                         <div key={remarkIdx} className={`mb-2 rounded-md p-2 ${isCurrentUser ? 'border border-primary/30' : ''} md:mb-3 md:p-3`}>
                                           <p className={`mb-1 text-xs font-semibold ${isCurrentUser ? 'text-primary' : 'text-muted-foreground'} md:mb-2 md:text-sm`}>
                                             {isCurrentUser ? "Your Remarks:" : `${judgeName}'s Remarks:`}
                                           </p>
                                           <ul className="list-disc space-y-0.5 pl-4 text-sm text-muted-foreground md:space-y-1 md:pl-5 md:text-base">
                                             {remarkPoints.map((point, pointIdx) => (
                                               <li key={`${remarkIdx}-${pointIdx}`}>{point}</li>
                                             ))}
                                           </ul>
                                         </div>
                                       );
                                     })
                                   ) : (
                                     <p className="flex h-full items-center justify-center text-center text-sm text-muted-foreground md:text-base">
                                       No remarks were found for this team.
                                     </p>
                                   )}
                                   {allRemarks.length > 0 && allRemarks.every(r => !r.remark || r.remark.split(REMARK_DELIMITER).every(p => p.trim() === '')) && (
                                      <p className="flex h-full items-center justify-center text-center text-sm text-muted-foreground md:text-base">
                                          No remarks were found for this team.
                                      </p>
                                   )}
                                 </div>
                              </div>

                              <div className="scoring-section flex w-full flex-col items-center justify-start">
                                <h3 className="mb-3 text-xl font-semibold text-foreground md:mb-6 md:text-3xl lg:text-4xl">Score Criteria</h3>
                                <div className="w-full space-y-4 rounded-lg border border-border p-2 pr-3 shadow-inner md:space-y-5 md:p-4 md:pr-5">
                                  {criterias.map((criteria, criteriaIndex) => {
                                    const currentScore = team.Scores?.find(
                                      (score) => score.criteriaId === criteria.id,
                                    )?.score;

                                    return (
                                      <div
                                        className="grid grid-cols-5 items-center gap-2 rounded-md p-1.5 transition-colors md:grid-cols-3 md:gap-4 md:p-3"
                                        key={criteria.id}
                                      >
                                        <span className="col-span-3 text-sm font-medium text-foreground md:col-span-2 md:text-lg">{criteria.criteria}</span>
                                        <div className={`col-span-2 flex justify-end pr-0 relative pb-3 md:col-span-1 md:pr-10 md:pb-0 ${criteriaIndex === 0 ? 'numeric-rating-example' : ''}`}>
                                           <NumericRating
                                              currentRating={currentScore}
                                              onRatingChange={(newRating) => {
                                                  updateScore.mutate({
                                                      teamId: team.id,
                                                      criteriaId: criteria.id,
                                                      score: newRating,
                                                  });
                                              }}
                                              max={MAX_SCORE}
                                           />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious className="carousel-navigation-prev absolute left-1 top-1/2 -translate-y-1/2 w-10 p-1 text-foreground hover:text-foreground hidden lg:inline-flex lg:left-[-70px] lg:w-16 lg:p-2" />
                <CarouselNext className="carousel-navigation-next absolute right-1 top-1/2 -translate-y-1/2 w-10 p-1 text-foreground hover:text-foreground hidden lg:inline-flex lg:right-[-70px] lg:w-16 lg:p-2" />
              </Carousel>
            </div>
          ) : (
             <div className="flex flex-grow items-center justify-center">
                 <p className="text-xl text-muted-foreground">No teams match the current filter or search.</p>
             </div>
          )}
        </div>
      )}

      {!isLoading && !isError && (!teams || teams.length === 0) && (
        <div className="flex h-screen w-screen items-center justify-center p-6">
          <p className="text-xl text-gray-500">No teams available for scoring at this stage.</p>
        </div>
      )}
      {!isLoading && !isError && (!criterias || criterias.length === 0) && judgeType && (
        <div className="flex w-screen items-center justify-center p-6 text-center">
          <p className="text-xl text-muted-foreground">No scoring criteria found for your assigned round ({judgeType}).</p>
        </div>
      )}

      <Dialog open={isRemarkModalOpen} onOpenChange={setIsRemarkModalOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">Add/Edit Remarks</DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              {editingTeamName ?? "Selected Team"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-3 py-3 md:space-y-4 md:py-4">
            <div className="space-y-2 overflow-y-auto rounded-md border p-2 pr-3 shadow-inner md:space-y-3 md:p-3 md:pr-4">
              {editingRemarks.map((point, pointIndex) => (
                <div key={pointIndex} className="flex items-center gap-2 md:gap-3">
                  <span className="text-lg font-semibold text-primary md:text-xl">•</span>
                  <Input
                    type="text"
                    value={point}
                    onChange={(e) => handleRemarkChange(pointIndex, e.target.value)}
                    placeholder="Enter remark point..."
                    className="flex-grow rounded-md border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary md:text-base"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePoint(pointIndex)}
                    disabled={editingRemarks.length <= 1}
                    className="h-6 w-6 text-destructive disabled:opacity-50 md:h-7 md:w-7"
                  >
                    <X className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button onClick={handleAddPoint} variant="outline" size="sm" className="mt-2 self-start border-dashed border-primary text-primary hover:text-primary">
              <Plus className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" /> Add Point
            </Button>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary" size="sm" className="w-full sm:w-auto">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleSaveRemarks}
              disabled={addRemarkMutation.isLoading}
              size="sm"
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
