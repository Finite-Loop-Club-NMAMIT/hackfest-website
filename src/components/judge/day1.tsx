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
import Tutorial from "./tutorial"; // Import the Tutorial component
import type { Step } from 'react-joyride'; // Import Step type


type TeamWithRelations = RouterOutputs["judges"]["getTeams"][number];


const REMARK_DELIMITER = ';;;';
const LAST_TEAM_INDEX_KEY = 'day1_lastTeamIndex';

export default function DAY1() {
  const teamsQuery = api.judges.getTeams.useQuery();
  const teams = teamsQuery.data;
  const { data: session } = useSession();
  const judgeInfoQuery = api.judges.getDay.useQuery(undefined, { // Fetch judge info including tutorial status
      enabled: !!session?.user, // Only run if user is logged in
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
  const [showTutorial, setShowTutorial] = useState(false); // State to control tutorial visibility

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

  const markTutorialMutation = api.judges.markTutorialAsShown.useMutation({ // Mutation to mark tutorial as shown
      onSuccess: () => {
          void judgeInfoQuery.refetch(); // Refetch judge info to update status
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


    setIsSaving(true); // Set saving state
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

    if (teams && teams[currentTeamIndex] && session?.user && currentRemarks.length === 0) { // Check if remarks are empty and session exists
      // Find the remark specifically made by the current judge
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
            const previousIndex = currentTeamIndex; // Get the index we are navigating away from
            const newIndex = carouselApi.selectedScrollSnap();

            // Save remarks of the *previous* slide before updating index/state
            await handleSaveRemarks(previousIndex);

            // Update index state AFTER saving previous remarks
            setCurrentTeamIndex(newIndex);

            // Load remarks for the new slide
            if (teams && teams[newIndex]) {
                // Find the remark specifically made by the current judge
                const userRemark = teams[newIndex]?.Remark?.find(r => r.judgeId === session.user.id);
                const existingRemark = userRemark?.remark;

                if (existingRemark) {
                    setCurrentRemarks(existingRemark.split(REMARK_DELIMITER).filter((point: string) => point.trim() !== ''));
                } else {
                    setCurrentRemarks(['']); // Reset to one empty point for new slide if no remark by this judge
                }
            } else {
                setCurrentRemarks(['']); // Reset if teams not loaded
            }
        })(); // Immediately invoke the async function
    };


    carouselApi.on("select", handleSelect);

    return () => {
      carouselApi?.off("select", handleSelect);
    };
    // Add handleSaveRemarks, currentTeamIndex, and session?.user to dependencies
  }, [carouselApi, teams, handleSaveRemarks, currentTeamIndex, session?.user]);

  // Effect to show tutorial if not shown before
  useEffect(() => {
      if (judgeInfoQuery.isSuccess && judgeInfoQuery.data && !judgeInfoQuery.data.tutorialShown) {
          // Add a small delay to ensure the page elements are rendered
          const timer = setTimeout(() => setShowTutorial(true), 500);
          return () => clearTimeout(timer);
      }
  }, [judgeInfoQuery.isSuccess, judgeInfoQuery.data]);

  if (!session?.user) {
    return <div>Unauthorized</div>;
  }

  const handleAddPoint = () => {
    setCurrentRemarks([...currentRemarks, '']); // Add a new empty point
  };

  const handleRemovePoint = (index: number) => {
    if (currentRemarks.length > 1) { // Keep at least one point
      const newRemarks = [...currentRemarks];
      newRemarks.splice(index, 1);
      setCurrentRemarks(newRemarks);
    } else {
        setCurrentRemarks(['']); // Reset to one empty point if last one is removed
    }
  };

  const handleRemarkChange = (index: number, value: string) => {
    const newRemarks = [...currentRemarks];
    newRemarks[index] = value;
    setCurrentRemarks(newRemarks);
  };

  // Manual save button still uses the same logic but provides immediate feedback
  const handleManualSave = async () => {
      // Call save for the currently displayed team index
      await handleSaveRemarks(currentTeamIndex);
  };

  const handleTutorialComplete = () => {
      setShowTutorial(false);
      markTutorialMutation.mutate(); // Call mutation to update DB
  };

  // Define tutorial steps for Day 1
  const day1TutorialSteps: Step[] = [
      {
          target: '.carousel-container', // Use a class or ID for the main container
          content: 'Welcome to the Day 1 Remarks Dashboard! Use the arrows or swipe to navigate between teams.',
          placement: 'center',
          disableBeacon: true,
      },
      {
          target: '.team-info-header', // Add a class to the team info section
          content: 'Here you can see the team name, number, track, and members.',
          placement: 'bottom',
      },
      {
          target: '.remark-input-section', // Add a class to the remark input section
          content: 'This is where you enter your remarks for the current team. Use the "+" button to add points and "x" to remove them.',
          placement: 'top',
      },
      {
          target: '.add-remark-point-button', // Add a class to the add point button
          content: 'Click here to add a new remark point.',
          placement: 'right',
      },
      {
          target: '.save-remarks-button', // Add a class to the save button
          content: 'Click "Save Remarks" to save your input. Remarks are also auto-saved when you navigate away.',
          placement: 'top',
      },
      {
          target: '.carousel-navigation-prev', // Add class to prev button
          content: 'Use this button to go to the previous team.',
          placement: 'right',
      },
      {
          target: '.carousel-navigation-next', // Add class to next button
          content: 'Use this button to go to the next team. You can also swipe on touch devices.',
          placement: 'left',
      },
      {
          target: 'body',
          content: "That's it! You're ready to start adding remarks.",
          placement: 'center',
      },
  ];


  return (
    <>
      {/* Add Tutorial Component */}
      <Tutorial run={showTutorial} steps={day1TutorialSteps} onComplete={handleTutorialComplete} />

      {teamsQuery.isLoading && (
        <div className="flex h-screen w-screen items-center justify-center bg-background"> {/* Added background */}
          <Spinner size="large" /> {/* Larger spinner */}
        </div>
      )}
      {teamsQuery.isSuccess && teams && teams.length > 0 && (
        // Add a class for the tutorial target
        <div className="carousel-container flex w-full items-center justify-center px-2 py-4 md:px-4 md:py-8">
          <Carousel
            setApi={setCarouselApi} // Pass the setter function
            className="m-auto flex h-[85vh] w-full max-w-full items-center justify-center md:max-w-7xl" // Adjusted height/width
          >
            <CarouselContent>
              {teams.map((team: TeamWithRelations, index: number) => { // Add types for team and index
                // Find the remark specifically made by the current judge for display purposes
                const userRemarkObj = team.Remark?.find(r => r.judgeId === session.user.id);
                const existingRemark = userRemarkObj?.remark;
                // Split using the delimiter for display
                const remarkPoints = existingRemark ? existingRemark.split(REMARK_DELIMITER).filter((point: string) => point.trim() !== '') : [];

                return (
                  <CarouselItem key={team.id}>
                    {/* Adjust height slightly for mobile */}
                    {/* Reduce height */}
                    <Card className="h-[80vh] overflow-hidden rounded-lg bg-card shadow-lg md:h-[80vh]"> {/* Added bg, shadow, rounded */}
                      {/* Adjust padding for mobile */}
                      <CardContent className="flex h-full flex-col items-center justify-start p-4 md:p-6 lg:p-8">
                        {/* Add a class for the tutorial target */}
                        <div className="team-info-header mb-4 flex w-full flex-col items-center justify-center gap-3 pb-4 md:mb-6 md:gap-4 md:pb-6">
                          {/* Top Row: Team Name and Track */}
                          <div className="flex w-full items-start justify-between">
                             {/* Left: Team Name and Number */}
                             <div className="flex flex-col items-start">
                               {/* Adjust font size for mobile */}
                               <h1 className="team-name-info w-full truncate text-left text-2xl font-bold text-foreground md:text-3xl lg:text-5xl">
                                 {team.name}
                               </h1>
                               {/* Adjust font size for mobile */}
                               <span className="mt-1 text-xs font-medium text-primary md:text-sm">Team #{team.teamNo}</span>
                             </div>
                             {/* Right: Track */}
                             {/* Adjust font size and padding for mobile */}
                            <div className="flex flex-shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground md:px-3 md:py-1 md:text-sm">
                              <Info className="h-3 w-3 md:h-4 md:w-4" />
                              {/* Shorten "Track:" on mobile */}
                              <span className="hidden sm:inline">Track:</span> {team.IdeaSubmission?.track.replace(/_/g, ' ') ?? 'N/A'}
                            </div>
                          </div>

                          {/* Bottom Row: Team Members */}
                          {/* Adjust gap and padding for mobile */}
                          <div className="flex w-full flex-wrap items-start justify-center gap-x-3 gap-y-2 pt-2 md:gap-x-4 md:pt-4">
                              {team.Members.map((member) => (
                                // Adjust width and image size for mobile
                                <div key={member.name} className="flex w-16 flex-col items-center text-center md:w-20">
                                  {member.image ? (
                                    <Image
                                      src={member.image}
                                      alt={member.name ?? 'Member'}
                                      width={40} // Smaller size for mobile
                                      height={40} // Smaller size for mobile
                                      className="rounded-full object-cover ring-2 ring-offset-2 ring-offset-card ring-border transition-transform duration-200 hover:scale-110 hover:ring-primary md:h-12 md:w-12" // Enhanced styling
                                    />
                                  ) : (
                                    <UserCircle className="h-10 w-10 text-muted-foreground transition-colors duration-200 hover:text-primary md:h-12 md:w-12" /> // Smaller size for mobile
                                  )}
                                  {/* Adjust font size for mobile */}
                                  <span className="mt-1 w-full text-[10px] text-muted-foreground md:mt-1.5 md:text-xs">{member.name}</span>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Remark Input Section */}
                        {index === currentTeamIndex && (
                           // Add a class for the tutorial target
                           <div className="remark-input-section flex h-full w-full flex-col space-y-3 overflow-hidden pt-1 md:space-y-4 md:pt-2">
                             {/* Adjust font size for mobile */}
                             <h3 className="text-xl font-semibold text-foreground md:text-2xl lg:text-3xl">Your Remarks</h3> {/* Changed title */}
                             {/* Adjust padding for mobile */}
                             <div className="flex-grow space-y-2 overflow-y-auto rounded-md bg-background/50 p-2 pr-3 shadow-inner md:space-y-3 md:p-3 md:pr-4">
                               {currentRemarks.map((point, pointIndex) => (
                                 // Adjust gap for mobile
                                 <div key={pointIndex} className="flex items-center gap-2 md:gap-3">
                                   {/* Adjust size for mobile */}
                                   <span className="text-lg font-semibold text-primary md:text-xl">•</span> {/* Larger bullet */}
                                   <Input
                                     type="text"
                                     value={point}
                                     onChange={(e) => handleRemarkChange(pointIndex, e.target.value)}
                                     placeholder="Enter remark point..."
                                     // Adjust font size for mobile
                                     className="flex-grow rounded-md border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary md:text-base" // Enhanced input style
                                   />
                                   <Button
                                     variant="ghost" // Ghost variant for less emphasis
                                     size="icon"
                                     onClick={() => handleRemovePoint(pointIndex)}
                                     disabled={currentRemarks.length <= 1}
                                     // Adjust size for mobile
                                     className="h-6 w-6 text-destructive hover:bg-destructive/10 disabled:opacity-50 md:h-7 md:w-7" // Adjusted size, color, hover
                                   >
                                     <X className="h-3 w-3 md:h-4 md:w-4" /> {/* Use the X icon */}
                                   </Button>
                                 </div>
                               ))}
                             </div>
                             {/* Action Buttons - Stack vertically on mobile, remove mt-auto */}
                             <div className="flex flex-col gap-2 pt-2 md:flex-row md:justify-end md:gap-3 md:pt-4"> {/* Removed mt-auto */}
                                {/* Add a class for the tutorial target */}
                                <Button onClick={handleAddPoint} variant="outline" size="sm" className="add-remark-point-button flex items-center gap-1 border-dashed border-primary text-primary hover:bg-primary/10 hover:text-primary md:size-auto"> {/* Dashed outline */}
                                  <Plus className="h-4 w-4" /> Add Point
                                </Button>
                                {/* Add a class for the tutorial target */}
                                <Button
                                  onClick={handleManualSave} // Changed to manual save handler
                                  disabled={isSaving || addRemarkMutation.isLoading} // Disable if saving
                                  size="sm" // Smaller size for mobile
                                  className="save-remarks-button bg-primary text-primary-foreground hover:bg-primary/90 md:size-auto" // Standard primary button
                                >
                                  {/* Show spinner if saving */}
                                  {(isSaving || addRemarkMutation.isLoading) ? <Spinner size="small" /> : "Save Remarks"}
                                </Button>
                             </div>
                           </div>
                        )}
                         {/* Display Saved Remarks - Remove border */}
                         {index !== currentTeamIndex && remarkPoints.length > 0 && (
                            // Adjust padding/spacing for mobile
                            <div className="flex h-full w-full flex-col space-y-3 pt-1 md:space-y-4 md:pt-2">
                                {/* Adjust font size for mobile */}
                                <h3 className="text-xl font-semibold text-foreground md:text-2xl lg:text-3xl">Your Saved Remarks</h3> {/* Changed title */}
                                {/* Adjust padding and text size for mobile */}
                                <ul className="list-disc space-y-1 rounded-md bg-background/50 p-3 pl-6 text-sm text-foreground shadow-inner md:space-y-2 md:p-4 md:pl-8 md:text-base"> {/* Removed border, Added bg, padding, shadow */}
                                    {remarkPoints.map((point: string, idx: number) => (
                                        <li key={idx}>{point}</li>
                                    ))}
                                </ul>
                            </div>
                         )}
                         {/* No Remarks Message - Enhanced Styling */}
                         {index !== currentTeamIndex && remarkPoints.length === 0 && (
                             <div className="flex h-full w-full flex-col items-center justify-center text-center">
                                 {/* Adjust font size for mobile */}
                                 <p className="text-base text-muted-foreground md:text-lg">You haven&apos;t saved any remarks for this team yet.</p> {/* Changed message */}
                             </div>
                         )}
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            {/* Add classes for tutorial targets */}
            <CarouselPrevious className="carousel-navigation-prev absolute left-1 top-1/2 -translate-y-1/2 h-10 w-10 p-1 text-foreground hover:bg-muted hover:text-foreground hidden md:inline-flex md:left-[-60px] md:h-14 md:w-14 md:p-2" />
            <CarouselNext className="carousel-navigation-next absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-1 text-foreground hover:bg-muted hover:text-foreground hidden md:inline-flex md:right-[-60px] md:h-14 md:w-14 md:p-2" />
          </Carousel>
        </div>
      )}
       {teamsQuery.isSuccess && (!teams || teams.length === 0) && (
           <div className="flex h-screen w-screen items-center justify-center">
               <p className="text-xl text-gray-500">No teams available for remarking at this stage.</p>
           </div>
       )}
       {teamsQuery.isError && (
            <div className="flex h-screen w-screen items-center justify-center bg-background p-4 text-center">
               <p className="text-xl text-destructive">Error loading teams: {teamsQuery.error.message}</p>
           </div>
       )}
    </>
  );
}
