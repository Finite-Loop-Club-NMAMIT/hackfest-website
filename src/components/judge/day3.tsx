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
import { Button } from "../ui/button";
import { toast } from "sonner";
import { TeamProgress } from "@prisma/client";
import { ArrowUpCircle, ArrowDownCircle, CheckCircle, Circle, UserCircle, Info, Search } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import Tutorial from "./tutorial";
import type { Step } from 'react-joyride';

type RemarkWithJudge = NonNullable<RouterOutputs["judges"]["getDay3Teams"][number]["Remark"]>[number];

const REMARK_DELIMITER = ';;;';

export default function DAY3() {
  const { data: session } = useSession();
  const teamsQuery = api.judges.getDay3Teams.useQuery();
  const judgeInfoQuery = api.judges.getDay.useQuery(undefined, {
      enabled: !!session?.user,
  });
  const teams = useMemo(() => teamsQuery.data ?? [], [teamsQuery.data]);

  // Update search states to match Day 1 and Day 2
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
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

  const uniqueTracks = useMemo(() => {
    const tracks = new Set<string>();
    (teamsQuery.data ?? []).forEach(team => {
      if (team.IdeaSubmission?.track) {
        tracks.add(team.IdeaSubmission.track);
      }
    });
    return Array.from(tracks);
  }, [teamsQuery.data]);

  // Update filtered teams to use unified search approach
  const filteredTeams = useMemo(() => {
    let filtered = teams;
    
    // Filter by track if not "all"
    if (selectedTrack !== "all") {
      filtered = filtered.filter(team => 
        team.IdeaSubmission?.track === selectedTrack
      );
    }
    
    // Filter by combined search (name or team number)
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.teamNo.toString().includes(searchQuery.trim())
      );
    }
    
    return filtered;
  }, [teams, selectedTrack, searchQuery]);

  useEffect(() => {
      if (judgeInfoQuery.isSuccess && judgeInfoQuery.data && !judgeInfoQuery.data.tutorialShown) {
          const timer = setTimeout(() => setShowTutorial(true), 500);
          return () => clearTimeout(timer);
      }
  }, [judgeInfoQuery.isSuccess, judgeInfoQuery.data]);

  const changeProgress = api.organiser.changeTeamProgress.useMutation({
    onSuccess: async (data) => {
      await teamsQuery.refetch();
      toast.success(`Team ${data.name} progress updated to ${data.teamProgress}`);
    },
    onError: (error) => {
       toast.error(`Failed to update progress: ${error.message}`);
    }
  });

  const handleProgressChange = async (teamId: string, targetProgress: TeamProgress) => {
     await changeProgress.mutateAsync({
       teamId: teamId,
       progress: targetProgress,
     });
  };

  // Update the search handler to match Day 1 and Day 2
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

  const handleTutorialComplete = () => {
      setShowTutorial(false);
      markTutorialMutation.mutate();
  };

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

  // Update tutorial steps to match the updated search UI
  const day3TutorialSteps: Step[] = [
    {
      target: 'body',
      content: 'Welcome to the Day 3 Finals Dashboard! You\'ll be selecting the winning teams here.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.filter-search-controls',
      content: 'Use these controls to find specific teams by name or number, and filter by track.',
      placement: 'bottom',
    },
    {
      target: '.search-button',
      content: 'Search for teams by name or number, then click to find them.',
      placement: 'bottom',
    },
    {
      target: '.carousel-container',
      content: 'Navigate between teams using arrow keys on your keyboard.',
      placement: 'center',
    },
    {
      target: '.promote-button',
      content: 'Click here to promote a team to the Top 15 finalists.',
      placement: 'bottom',
    },
    {
      target: '.demote-button',
      content: 'Use this to move a team back to the selection pool if needed.',
      placement: 'bottom',
    },
    {
      target: 'body',
      content: 'You\'re all set to make the final team selections!',
      placement: 'center',
    }
  ];

  return (
    <>
      <Tutorial 
        run={showTutorial} 
        steps={day3TutorialSteps} 
        onComplete={handleTutorialComplete}
      />

      {teamsQuery.isLoading && (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
          <Spinner size="large" />
        </div>
      )}
       {teamsQuery.isError && (
            <div className="flex h-screen w-screen items-center justify-center bg-background p-4 text-center">
               <p className="text-xl text-destructive">Error loading teams: {teamsQuery.error.message}</p>
           </div>
       )}

      {teamsQuery.isSuccess && (
        <div className="flex h-screen w-full flex-col items-center justify-start px-2 py-4 md:p-8">

          {/* Updated search and filter controls to match Day 1 and Day 2 */}
          <div className="filter-search-controls mb-4 flex w-full max-w-full flex-col items-center gap-3 px-2 md:max-w-4xl md:flex-row md:gap-4">
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
                  {uniqueTracks.map(track => (
                    <SelectItem key={track} value={track}>
                      {track.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredTeams.length > 0 ? (
            <div className="carousel-container flex w-full flex-grow items-center justify-center overflow-hidden bg-background">
              <Carousel 
                setApi={setCarouselApi} 
                className="m-auto flex h-[80vh] w-full max-w-full items-center justify-center md:max-w-4xl"
                opts={{
                  align: "center",
                  containScroll: "trimSnaps",
                }}
              >
                <CarouselContent className="overflow-visible">
                  {filteredTeams.map((team) => {
                    const isTop15 = team.teamProgress === TeamProgress.TOP15;
                    const isSelected = team.teamProgress === TeamProgress.SELECTED;
                    const allRemarks = team.Remark ?? [];
                    const judgeId = session?.user?.id;

                    return (
                      <CarouselItem key={team.id}>
                        <Card className="min-h-[75vh] overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-card shadow-lg md:min-h-[75vh]">
                          <CardContent className="flex flex-col items-center justify-between p-4 md:p-6 lg:p-8">
                            <div className="team-info-header flex w-full flex-col items-center justify-center gap-3 border-b border-border pb-4 md:gap-4 md:pb-6">
                              <div className="flex w-full flex-col items-center gap-2 md:flex-row md:items-start md:justify-between">
                                 <div className="flex flex-col items-center text-center md:items-start md:text-left">
                                   <h1 className="w-full truncate text-center text-2xl font-bold text-foreground md:text-left md:text-3xl lg:text-5xl">
                                     {team.name}
                                   </h1>
                                   <span className="mt-1 text-xs font-medium text-primary md:text-sm">Team #{team.teamNo}</span>
                                 </div>
                                <div className="flex flex-shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground md:px-3 md:py-1 md:text-sm">
                                  <Info className="h-3 w-3 md:h-4 md:w-4" />
                                  <span className="hidden sm:inline">Track:</span> {team.IdeaSubmission?.track.replace(/_/g, ' ') ?? 'N/A'}
                                </div>
                              </div>

                              <div className="flex w-full flex-wrap items-start justify-center gap-x-3 gap-y-2 pt-2 md:gap-x-4 md:pt-4">
                                  {team.Members.map((member) => (
                                    <div key={member.name} className="flex w-16 flex-col items-center text-center md:w-20">
                                      {member.image ? (
                                        <Image
                                          src={member.image}
                                          alt={member.name ?? 'Member'}
                                          width={40}
                                          height={40}
                                          className="rounded-full object-cover ring-2 ring-offset-2 ring-offset-card ring-border transition-transform duration-200 hover:scale-110 hover:ring-primary md:h-12 md:w-12"
                                        />
                                      ) : (
                                        <UserCircle className="h-10 w-10 text-muted-foreground transition-colors duration-200 hover:text-primary md:h-12 md:w-12" />
                                      )}
                                      <span className="mt-1 w-full text-[10px] text-muted-foreground md:mt-1.5 md:text-xs">{member.name}</span>
                                    </div>
                                  ))}
                              </div>
                            </div>

                            <div className="judge-remarks-section flex w-full flex-col items-center justify-start py-3 md:py-4">
                              <h3 className="mb-2 text-base font-semibold text-foreground md:mb-3 md:text-lg">Judge Remarks</h3>
                              <div className="w-full space-y-2 rounded-lg border border-border bg-background/50 p-2 shadow-inner md:space-y-3 md:p-3">
                                {allRemarks.length > 0 ? (
                                  allRemarks.map((remarkEntry: RemarkWithJudge, remarkIdx) => {
                                    const remarkPoints = remarkEntry.remark ? remarkEntry.remark.split(REMARK_DELIMITER).filter(point => point.trim() !== '') : [];
                                    const judgeName = remarkEntry.Judge?.User?.[0]?.name ?? `Unknown Judge (${remarkEntry.Judge?.type ?? 'N/A'})`;
                                    const isCurrentUser = remarkEntry.Judge?.User?.some(u => u?.id === judgeId);

                                    if (remarkPoints.length === 0) return null;

                                    return (
                                      <div key={remarkIdx} className={`mb-1 rounded-md p-1.5 text-xs ${isCurrentUser ? 'bg-primary/10 border border-primary/30' : ''} md:mb-2 md:p-2 md:text-sm`}>
                                        <p className={`mb-1 font-semibold ${isCurrentUser ? 'text-primary' : 'text-muted-foreground'}`}>
                                          {isCurrentUser ? "Your Remarks:" : `${judgeName}:`}
                                        </p>
                                        <ul className="list-disc space-y-0.5 pl-4 text-muted-foreground md:space-y-1 md:pl-5">
                                          {remarkPoints.map((point, pointIdx) => (
                                            <li key={`${remarkIdx}-${pointIdx}`}>{point}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <p className="flex h-full items-center justify-center text-center text-xs text-muted-foreground md:text-sm">
                                    No remarks were found for this team.
                                  </p>
                                )}
                                {allRemarks.length > 0 && allRemarks.every(r => !r.remark || r.remark.split(REMARK_DELIMITER).every(p => p.trim() === '')) && (
                                  <p className="flex h-full items-center justify-center text-center text-xs text-muted-foreground md:text-sm">
                                    No remarks were found for this team.
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="progress-control-section flex h-auto w-full flex-col items-center justify-center gap-4 pt-4 md:gap-6 md:pt-8">
                               <h3 className="mb-2 text-xl font-semibold text-foreground md:mb-4 md:text-2xl lg:text-3xl">Manage Team Progress</h3>
                               <Button
                                 onClick={() => handleProgressChange(team.id, TeamProgress.TOP15)}
                                 disabled={isTop15 || changeProgress.isLoading}
                                 className={`promote-button w-48 transform rounded-lg px-4 py-2 text-sm font-medium shadow-md transition duration-200 ease-in-out hover:scale-105 md:w-56 md:px-6 md:py-3 md:text-base ${
                                   isTop15
                                     ? 'cursor-not-allowed bg-green-600 text-white opacity-70'
                                     : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                                 }`}
                               >
                                 {isTop15 ? <CheckCircle className="mr-1 h-4 w-4 md:mr-2 md:h-5 md:w-5" /> : <ArrowUpCircle className="mr-1 h-4 w-4 md:mr-2 md:h-5 md:w-5" />}
                                 {isTop15 ? 'Currently Top 15' : 'Promote to Top 15'}
                               </Button>

                               <Button
                                 onClick={() => handleProgressChange(team.id, TeamProgress.SELECTED)}
                                 disabled={isSelected || changeProgress.isLoading}
                                 variant={isSelected ? "outline" : "destructive"}
                                 className={`demote-button w-48 transform rounded-lg px-4 py-2 text-sm font-medium shadow-md transition duration-200 ease-in-out hover:scale-105 md:w-56 md:px-6 md:py-3 md:text-base ${
                                   isSelected
                                     ? 'cursor-not-allowed border-muted text-muted-foreground opacity-70'
                                     : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                 }`}
                               >
                                 {isSelected ? <Circle className="mr-1 h-4 w-4 md:mr-2 md:h-5 md:w-5" /> : <ArrowDownCircle className="mr-1 h-4 w-4 md:mr-2 md:h-5 md:w-5" />}
                                 {isSelected ? 'Currently Selected' : 'Demote to Top 60'}
                               </Button>

                               {changeProgress.isLoading && changeProgress.variables?.teamId === team.id && (
                                   <div className="mt-2 flex items-center text-xs text-muted-foreground md:mt-4 md:text-sm">
                                       <Spinner size="small" />
                                       <span className="ml-2 animate-pulse">Updating status...</span>
                                   </div>
                               )}
                            </div>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious className="carousel-navigation-prev absolute left-1 top-1/2 -translate-y-1/2 h-10 w-10 p-1 text-foreground hover:bg-muted hover:text-foreground hidden lg:inline-flex lg:left-[-60px] lg:h-14 lg:w-14 lg:p-2" />
                <CarouselNext className="carousel-navigation-next absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-1 text-foreground hover:bg-muted hover:text-foreground hidden lg:inline-flex lg:right-[-60px] lg:h-14 lg:w-14 lg:p-2" />
              </Carousel>
            </div>
          ) : (
             <div className="flex flex-grow items-center justify-center">
                 <p className="text-xl text-muted-foreground">No teams match the current filter or search.</p>
             </div>
          )}
        </div>
      )}
       {teamsQuery.isSuccess && teams.length === 0 && (
           <div className="flex h-screen w-screen items-center justify-center">
               <p className="text-xl text-gray-500">No teams available for final selection at this stage.</p>
           </div>
       )}
    </>
  );
}
