import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "~/components/ui/carousel";
import Spinner from "../spinner";
import { Card, CardContent } from "../ui/card";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Input } from "../ui/input";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import { X, UserCircle, Plus, Info } from "lucide-react";
import Image from "next/image";
import Tutorial from "./tutorial";
import type { Step } from 'react-joyride';


type TeamWithRelations = RouterOutputs["judges"]["getTeams"][number];


const REMARK_DELIMITER = ';;;';
const LAST_TEAM_INDEX_KEY = 'day1_lastTeamIndex';

export default function DAY1() {
  const teamsQuery = api.judges.getTeams.useQuery();
  const teams = teamsQuery.data;
  const { data: session } = useSession();
  const judgeInfoQuery = api.judges.getDay.useQuery(undefined, {
      enabled: !!session?.user,
  });

  const [currentTeamIndex, setCurrentTeamIndex] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedIndex = localStorage.getItem(LAST_TEAM_INDEX_KEY);
      return savedIndex ? parseInt(savedIndex, 10) : 0;
    }
    return 0;
  });

  const [currentRemarks, setCurrentRemarks] = useState<string[]>([]);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [isSaving, setIsSaving] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const addRemarkMutation = api.remark.addRemark.useMutation({
    onSuccess: async () => {
      await teamsQuery.refetch();
      
    },
    onError: (error) => { 
       toast.error(`Failed to save remark: ${error.message}`);
    },
    onSettled: () => {
      setIsSaving(false);
    }
  });

  const markTutorialMutation = api.judges.markTutorialAsShown.useMutation({
      onSuccess: () => {
          void judgeInfoQuery.refetch();
          toast.success("Tutorial completed!");
      },
      onError: (error) => {
          toast.error(`Failed to save tutorial status: ${error.message}`);
      }
  });

  const handleSaveRemarks = useCallback(async (indexToSave: number) => {
    if (isSaving || !teams || !teams[indexToSave] || !session?.user) return;
    const remarksToSave = currentRemarks.filter((point: string) => point.trim() !== '');
    const existingSavedRemarkObj = teams[indexToSave]?.Remark?.find(r => r.judgeId === session.user.id);
    const existingSavedRemark = existingSavedRemarkObj?.remark ?? '';
    const remarkString = remarksToSave.join(REMARK_DELIMITER);
    if (remarkString === existingSavedRemark) {
        return;
    }
     if (remarksToSave.length === 0 && !existingSavedRemark) {
        return;
    }


    setIsSaving(true);
    const teamId = teams[indexToSave].id;
    const judgeId = session.user.id;

    try {
        await addRemarkMutation.mutateAsync({
            teamId: teamId,
            judgeId: judgeId,
            remark: remarkString,
        });
        toast.success(`Remarks for Team ${teams[indexToSave].teamNo} auto-saved`);
    } catch (error) {
        toast.error("Auto-save failed:");
    }
  }, [addRemarkMutation, currentRemarks, isSaving, session?.user, teams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LAST_TEAM_INDEX_KEY, currentTeamIndex.toString());
    }
  }, [currentTeamIndex]);

  useEffect(() => {
    if (carouselApi && teams && teams.length > currentTeamIndex) {

      carouselApi.scrollTo(currentTeamIndex, true);
    }
  }, [carouselApi, teams, currentTeamIndex]);

  useEffect(() => {

    if (teams && teams[currentTeamIndex] && session?.user && currentRemarks.length === 0) {
      const userRemark = teams[currentTeamIndex]?.Remark?.find(r => r.judgeId === session.user.id);
      const existingRemark = userRemark?.remark;

      if (existingRemark) {
        setCurrentRemarks(existingRemark.split(REMARK_DELIMITER).filter((point: string) => point.trim() !== ''));
      } else {
        setCurrentRemarks(['']);
      }
    }

  }, [teams, currentTeamIndex, currentRemarks.length, session?.user]);

  useEffect(() => {
    if (!carouselApi || !session?.user) {
      return;
    }

    const handleSelect = () => {
        void (async () => {
            const previousIndex = currentTeamIndex;
            const newIndex = carouselApi.selectedScrollSnap();

            await handleSaveRemarks(previousIndex);

            setCurrentTeamIndex(newIndex);

            if (teams && teams[newIndex]) {
                const userRemark = teams[newIndex]?.Remark?.find(r => r.judgeId === session.user.id);
                const existingRemark = userRemark?.remark;

                if (existingRemark) {
                    setCurrentRemarks(existingRemark.split(REMARK_DELIMITER).filter((point: string) => point.trim() !== ''));
                } else {
                    setCurrentRemarks(['']);
                }
            } else {
                setCurrentRemarks(['']);
            }
        })();
    };


    carouselApi.on("select", handleSelect);

    return () => {
      carouselApi?.off("select", handleSelect);
    };
  }, [carouselApi, teams, handleSaveRemarks, currentTeamIndex, session?.user]);

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

  // Enhanced tutorial steps with more details about buttons
  const day1TutorialSteps: Step[] = [
    {
      target: 'body',
      content: 'Welcome to the Day 1 Judge Dashboard! This tutorial will guide you through the interface.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.carousel-container',
      content: 'Navigate between teams using the left and right arrow keys on your keyboard.',
      placement: 'center',
    },
    {
      target: '.remark-input-section',
      content: 'In this section, you can add your evaluation remarks for each team.',
      placement: 'top',
    },
    {
      target: '.add-remark-point-button',
      content: 'Click this button to add more bullet points for detailed feedback about the team.',
      placement: 'bottom',
    },
    {
      target: '.save-remarks-button',
      content: 'Click here to manually save your remarks. Your remarks are also automatically saved when you navigate to another team.',
      placement: 'bottom',
    },
    {
      target: 'body',
      content: 'You\'re all set! Review each team and provide detailed remarks to help with team selection.',
      placement: 'center',
    }
  ];

  if (!session?.user) {
    return <div>Unauthorized</div>;
  }

  const handleAddPoint = () => {
    setCurrentRemarks([...currentRemarks, '']);
  };

  const handleRemovePoint = (index: number) => {
    if (currentRemarks.length > 1) {
      const newRemarks = [...currentRemarks];
      newRemarks.splice(index, 1);
      setCurrentRemarks(newRemarks);
    } else {
        setCurrentRemarks(['']);
    }
  };

  const handleRemarkChange = (index: number, value: string) => {
    const newRemarks = [...currentRemarks];
    newRemarks[index] = value;
    setCurrentRemarks(newRemarks);
  };

  const handleManualSave = async () => {
      await handleSaveRemarks(currentTeamIndex);
  };

  const handleTutorialComplete = () => {
      setShowTutorial(false);
      markTutorialMutation.mutate();
  };

  return (
    <>
      <Tutorial 
        run={showTutorial} 
        steps={day1TutorialSteps} 
        onComplete={handleTutorialComplete}
        continuous={true}
        showSkipButton={true}
      />

      {teamsQuery.isLoading && (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
          <Spinner size="large" />
        </div>
      )}
      {teamsQuery.isSuccess && teams && teams.length > 0 && (
        <div className="carousel-container flex w-full items-center justify-center px-2 py-4 md:px-6 lg:px-8 md:py-6 lg:py-8 overflow-hidden bg-background">
          <Carousel
            setApi={setCarouselApi}
            className="m-auto flex h-[85vh] w-full max-w-full items-center justify-center md:max-w-5xl lg:max-w-6xl"
            opts={{
              align: "center",
              containScroll: "trimSnaps",
            }}
          >
            <CarouselContent className="overflow-visible">
              {teams.map((team: TeamWithRelations, index: number) => {
                const userRemarkObj = team.Remark?.find(r => r.judgeId === session.user.id);
                const existingRemark = userRemarkObj?.remark;
                const remarkPoints = existingRemark ? existingRemark.split(REMARK_DELIMITER).filter((point: string) => point.trim() !== '') : [];

                return (
                  <CarouselItem key={team.id}>
                    <Card className="h-[80vh] overflow-hidden rounded-lg bg-card shadow-lg md:h-[78vh] lg:h-[75vh]">
                      <CardContent className="flex h-full flex-col items-center justify-start p-3 md:p-5 lg:p-6">
                        <div className="team-info-header mb-3 flex w-full flex-col items-center justify-center gap-2 pb-3 md:mb-4 md:gap-3 md:pb-4 lg:mb-5 lg:pb-5">
                          <div className="flex w-full items-start justify-between gap-2 md:gap-4">
                             <div className="flex flex-col items-start">
                               <h1 className="team-name-info w-full truncate text-left text-xl font-bold text-foreground md:text-2xl lg:text-4xl">
                                 {team.name}
                               </h1>
                               <span className="mt-1 text-xs font-medium text-primary md:text-sm lg:text-base">Team #{team.teamNo}</span>
                             </div>
                            <div className="flex flex-shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground md:px-2.5 md:py-1 md:text-xs lg:px-3 lg:text-sm">
                              <Info className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" />
                              <span className="hidden sm:inline">Track:</span> {team.IdeaSubmission?.track.replace(/_/g, ' ') ?? 'N/A'}
                            </div>
                          </div>

                          <div className="flex w-full flex-wrap items-start justify-center gap-x-2 gap-y-1 pt-1 md:gap-x-3 md:gap-y-2 md:pt-2 lg:gap-x-4 lg:pt-3">
                              {team.Members.map((member) => (
                                <div key={member.name} className="flex w-14 flex-col items-center text-center md:w-16 lg:w-20">
                                  {member.image ? (
                                    <Image
                                      src={member.image}
                                      alt={member.name ?? 'Member'}
                                      width={36}
                                      height={36}
                                      className="rounded-full object-cover ring-1 ring-offset-1 ring-offset-card ring-border transition-transform duration-200 hover:scale-110 hover:ring-primary md:h-10 md:w-10 lg:h-12 lg:w-12 md:ring-2 md:ring-offset-2"
                                    />
                                  ) : (
                                    <UserCircle className="h-9 w-9 text-muted-foreground transition-colors duration-200 hover:text-primary md:h-10 md:w-10 lg:h-12 lg:w-12"
                                    />
                                  )}
                                  <span className="mt-1 w-full text-[9px] text-muted-foreground md:mt-1 md:text-[10px] lg:mt-1.5 lg:text-xs">{member.name}</span>
                                </div>
                              ))}
                          </div>
                        </div>

                        {index === currentTeamIndex && (
                           <div className="remark-input-section flex h-full w-full flex-col space-y-2 overflow-hidden pt-1 md:space-y-3 md:pt-2">
                             <h3 className="text-lg font-semibold text-foreground md:text-xl lg:text-2xl">Your Remarks</h3>
                             <div className="flex-grow space-y-2 overflow-y-auto rounded-md bg-background/50 p-2 pr-2 shadow-inner md:space-y-2.5 md:p-2.5 md:pr-3 lg:p-3 lg:pr-4 scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent">
                               {currentRemarks.map((point, pointIndex) => (
                                 <div key={pointIndex} className="flex items-center gap-1.5 md:gap-2">
                                   <span className="text-base font-semibold text-primary md:text-lg">•</span>
                                   <Input
                                     type="text"
                                     value={point}
                                     onChange={(e) => handleRemarkChange(pointIndex, e.target.value)}
                                     placeholder="Enter remark point..."
                                     className="flex-grow rounded-md border-border bg-input px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary md:px-2.5 md:py-1.5 md:text-sm lg:text-base"
                                   />
                                   <Button
                                     variant="ghost"
                                     size="icon"
                                     onClick={() => handleRemovePoint(pointIndex)}
                                     disabled={currentRemarks.length <= 1}
                                     className="h-5 w-5 flex-shrink-0 text-destructive hover:bg-destructive/10 disabled:opacity-50 md:h-6 md:w-6"
                                   >
                                     <X className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                   </Button>
                                 </div>
                               ))}
                             </div>
                             <div className="flex flex-col gap-1.5 pt-1 md:flex-row md:justify-end md:gap-2 md:pt-2">
                                <Button onClick={handleAddPoint} variant="outline" size="sm" className="add-remark-point-button flex items-center gap-1 border-dashed border-primary px-2 py-1 text-xs text-primary hover:bg-primary/10 hover:text-primary md:px-3 md:py-1.5 md:text-sm lg:gap-1.5">
                                  <Plus className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" /> Add Point
                                </Button>
                                <Button
                                  onClick={handleManualSave}
                                  disabled={isSaving || addRemarkMutation.isLoading}
                                  size="sm"
                                  className="save-remarks-button bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90 md:px-3 md:py-1.5 md:text-sm"
                                >
                                  {(isSaving || addRemarkMutation.isLoading) ? <Spinner size="small" /> : "Save Remarks"}
                                </Button>
                             </div>
                           </div>
                        )}
                         {index !== currentTeamIndex && remarkPoints.length > 0 && (
                            <div className="flex h-full w-full flex-col space-y-2 pt-1 md:space-y-3 md:pt-2">
                                <h3 className="text-lg font-semibold text-foreground md:text-xl lg:text-2xl">Your Saved Remarks</h3>
                                <ul className="list-disc space-y-1 rounded-md bg-background/50 p-2 pl-5 text-xs text-foreground shadow-inner md:space-y-1.5 md:p-3 md:pl-6 md:text-sm lg:text-base scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent">
                                    {remarkPoints.map((point: string, idx: number) => (
                                        <li key={idx}>{point}</li>
                                    ))}
                                </ul>
                            </div>
                         )}
                         {index !== currentTeamIndex && remarkPoints.length === 0 && (
                             <div className="flex h-full w-full flex-col items-center justify-center text-center">
                                 <p className="text-sm text-muted-foreground md:text-base lg:text-lg">You haven&apos;t saved any remarks for this team yet.</p>
                             </div>
                         )}
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="carousel-navigation-prev absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 p-1 text-foreground hover:bg-muted hover:text-foreground hidden lg:inline-flex lg:left-[-50px] lg:h-12 lg:w-12 lg:p-2" />
            <CarouselNext className="carousel-navigation-next absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-1 text-foreground hover:bg-muted hover:text-foreground hidden lg:inline-flex lg:right-[-50px] lg:h-12 lg:w-12 lg:p-2" />
          </Carousel>
        </div>
      )}
       {teamsQuery.isSuccess && (!teams || teams.length === 0) && (
           <div className="flex h-screen w-screen items-center justify-center">
               <p className="text-lg text-gray-500 md:text-xl">No teams available for remarking at this stage.</p>
           </div>
       )}
       {teamsQuery.isError && (
            <div className="flex h-screen w-screen items-center justify-center bg-background p-4 text-center">
               <p className="text-lg text-destructive md:text-xl">Error loading teams: {teamsQuery.error.message}</p>
           </div>
       )}
    </>
  );
}
