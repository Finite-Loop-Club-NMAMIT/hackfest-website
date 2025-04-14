import { useState, useEffect, useMemo } from "react"; // Import hooks
import {
  Carousel,
  type CarouselApi, // Import CarouselApi
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  // Remove useCarousel import
} from "~/components/ui/carousel";
import { api, type RouterOutputs } from "~/utils/api";
import Spinner from "../spinner";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { TeamProgress } from "@prisma/client";
import { ArrowUpCircle, ArrowDownCircle, CheckCircle, Circle, UserCircle, Info, Search } from "lucide-react"; // Import Search icon
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Input } from "../ui/input"; // Import Input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"; // Import Select components
import { Label } from "../ui/label"; // Import Label
import Tutorial from "./tutorial"; // Import the Tutorial component
import type { Step } from 'react-joyride'; // Import Step type

// Define the remark structure based on the updated query
type RemarkWithJudge = NonNullable<RouterOutputs["judges"]["getDay3Teams"][number]["Remark"]>[number];
type Team = RouterOutputs["judges"]["getDay3Teams"][number]; // Define Team type

const REMARK_DELIMITER = ';;;';

export default function DAY3() {
  const { data: session } = useSession();
  const teamsQuery = api.judges.getDay3Teams.useQuery();
  const judgeInfoQuery = api.judges.getDay.useQuery(undefined, { // Fetch judge info including tutorial status
      enabled: !!session?.user, // Only run if user is logged in
  });
  // Memoize the teams array to prevent unnecessary re-renders in useEffect
  const teams = useMemo(() => teamsQuery.data ?? [], [teamsQuery.data]);

  // State for filtering and searching
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTeamNo, setSearchTeamNo] = useState(""); // State for team number search
  const [selectedTrack, setSelectedTrack] = useState<string>("all"); // 'all' means no filter
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null); // State for carousel API
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

  // Extract unique tracks for the filter dropdown
  const uniqueTracks = useMemo(() => {
    const tracks = new Set<string>();
    // Use teamsQuery.data directly and handle undefined case
    (teamsQuery.data ?? []).forEach(team => {
      if (team.IdeaSubmission?.track) {
        tracks.add(team.IdeaSubmission.track);
      }
    });
    return Array.from(tracks);
  }, [teamsQuery.data]); // Depend on teamsQuery.data

  // Effect to update filtered teams when data, search, or filter changes
  useEffect(() => {
    let currentTeams = teams;

    // Filter by track
    if (selectedTrack !== "all") {
      currentTeams = currentTeams.filter(team => team.IdeaSubmission?.track === selectedTrack);
    }

    // Filter by search query (team name)
    if (searchQuery.trim() !== "") {
      currentTeams = currentTeams.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by team number
    if (searchTeamNo.trim() !== "") {
      currentTeams = currentTeams.filter(team =>
        team.teamNo.toString().includes(searchTeamNo.trim())
      );
    }


    setFilteredTeams(currentTeams);
  }, [teams, selectedTrack, searchQuery, searchTeamNo]); // Add searchTeamNo to dependencies

  // Effect to show tutorial if not shown before
  useEffect(() => {
      if (judgeInfoQuery.isSuccess && judgeInfoQuery.data && !judgeInfoQuery.data.tutorialShown) {
          // Add a small delay to ensure the page elements are rendered
          const timer = setTimeout(() => setShowTutorial(true), 500);
          return () => clearTimeout(timer);
      }
  }, [judgeInfoQuery.isSuccess, judgeInfoQuery.data]);

  // Remove the useEffect hook that used setApi from useCarousel
  // useEffect(() => {
  //     if (!carouselApi) return;
  //     setApi(carouselApi); // Set the API instance when available
  // }, [carouselApi, setApi]);


  // Use the modified mutation from organiserRouter
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

  // Function to handle search and potentially navigate
  const handleSearch = () => {
      // Find the index based on which field has input
      const index = filteredTeams.findIndex(team =>
          searchQuery.trim() !== ""
              ? team.name.toLowerCase().includes(searchQuery.toLowerCase())
              : searchTeamNo.trim() !== ""
              ? team.teamNo.toString().includes(searchTeamNo.trim())
              : false // Should not happen if button is clicked when both are empty, but good practice
      );

      if (index !== -1 && carouselApi) {
          carouselApi.scrollTo(index); // Scroll to the found team
      } else if (searchQuery.trim() !== "" || searchTeamNo.trim() !== "") {
          const searchTerm = searchQuery.trim() !== "" ? searchQuery : searchTeamNo;
          toast.info(`Team matching "${searchTerm}" not found in the current filter.`);
      }
  };

  const handleTutorialComplete = () => {
      setShowTutorial(false);
      markTutorialMutation.mutate(); // Call mutation to update DB
  };

  // Define tutorial steps for Day 3
  const day3TutorialSteps: Step[] = [
      {
          target: '.filter-search-controls', // Add class to the controls container
          content: 'Welcome to the Day 3 Finals Dashboard! Use these controls to filter teams by name, number, or track.',
          placement: 'bottom',
          disableBeacon: true,
      },
      {
          target: '#search-team-name',
          content: 'Search for a team by its name.',
          placement: 'bottom',
      },
      {
          target: '#search-team-no',
          content: 'Search for a team by its number.',
          placement: 'bottom',
      },
       {
          target: '.search-button', // Add class to the search button
          content: 'Click the search icon after entering a name or number to jump to that team.',
          placement: 'bottom',
      },
      {
          target: '#track-filter',
          content: 'Filter the list of teams by their track.',
          placement: 'bottom',
      },
      {
          target: '.carousel-container', // Add class to carousel container
          content: 'Navigate through the filtered teams using the arrows or swipe.',
          placement: 'center',
      },
      {
          target: '.team-info-header', // Add class to team info section
          content: 'View team details and members here.',
          placement: 'bottom',
      },
      {
          target: '.judge-remarks-section', // Add class to remarks section
          content: 'Review remarks submitted by judges during previous rounds.',
          placement: 'top',
      },
      {
          target: '.progress-control-section', // Add class to progress control section
          content: 'Use these buttons to promote a team to the Top 15 or demote them back to the Top 60 selection pool.',
          placement: 'top',
      },
      {
          target: '.promote-button', // Add class to promote button
          content: 'Click here to mark the team as part of the Top 15 finalists.',
          placement: 'top',
      },
      {
          target: '.demote-button', // Add class to demote button
          content: 'Click here to move the team back to the Top 60 pool (if they were previously Top 15).',
          placement: 'top',
      },
      {
          target: 'body',
          content: "You're ready to manage the final team selections!",
          placement: 'center',
      },
  ];

  return (
    <>
      {/* Add Tutorial Component */}
      <Tutorial run={showTutorial} steps={day3TutorialSteps} onComplete={handleTutorialComplete} />

      {/* Loading and Error States */}
      {teamsQuery.isLoading && (
        <div className="flex h-screen w-screen items-center justify-center bg-background"> {/* Added background */}
          <Spinner size="large" /> {/* Larger spinner */}
        </div>
      )}
       {teamsQuery.isError && (
            <div className="flex h-screen w-screen items-center justify-center bg-background p-4 text-center"> {/* Added background, padding */}
               <p className="text-xl text-destructive">Error loading teams: {teamsQuery.error.message}</p>
           </div>
       )}

      {/* Main Content Area */}
      {teamsQuery.isSuccess && (
        <div className="flex h-screen w-full flex-col items-center justify-start px-2 py-4 md:p-8"> {/* Changed layout to flex-col */}

          {/* Add class for tutorial target */}
          <div className="filter-search-controls mb-4 flex w-full max-w-full flex-col items-center gap-3 px-2 md:max-w-4xl md:flex-row md:gap-4">
            {/* Search Input - Team Name */}
            <div className="flex w-full flex-col gap-1 md:w-1/3"> {/* Adjusted width */}
              <Label htmlFor="search-team-name" className="text-xs font-medium text-muted-foreground">Search Name</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="search-team-name"
                  type="text"
                  placeholder="Team name..."
                  value={searchQuery}
                  onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchTeamNo(""); // Clear team number search
                  }}
                  className="flex-grow"
                />
                 {/* Add class for tutorial target */}
                 <Button onClick={handleSearch} size="icon" variant="outline" aria-label="Search by Name" disabled={!searchQuery && !searchTeamNo} className="search-button">
                   <Search className="h-4 w-4" />
                 </Button>
              </div>
            </div>

            {/* Search Input - Team Number */}
            <div className="flex w-full flex-col gap-1 md:w-1/3"> {/* Adjusted width */}
              <Label htmlFor="search-team-no" className="text-xs font-medium text-muted-foreground">Search Team #</Label>
              <Input
                id="search-team-no"
                type="number" // Use type number for better input control
                placeholder="Team number..."
                value={searchTeamNo}
                onChange={(e) => {
                    setSearchTeamNo(e.target.value);
                    setSearchQuery(""); // Clear team name search
                }}
                className="flex-grow"
              />
              {/* Removed optional button here as the main search button handles both */}
            </div>


            {/* Track Filter Dropdown */}
            <div className="flex w-full flex-col gap-1 md:w-1/3"> {/* Adjusted width */}
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

          {/* Carousel Section */}
          {filteredTeams.length > 0 ? (
            // Add class for tutorial target
            <div className="carousel-container flex w-full flex-grow items-center justify-center"> {/* Use flex-grow to take remaining space */}
              {/* Pass setApi prop directly */}
              <Carousel setApi={setCarouselApi} className="m-auto flex h-[80vh] w-full max-w-full items-center justify-center md:max-w-4xl">
                <CarouselContent>
                  {/* Map over filteredTeams instead of teams */}
                  {filteredTeams.map((team) => {
                    const isTop15 = team.teamProgress === TeamProgress.TOP15;
                    const isSelected = team.teamProgress === TeamProgress.SELECTED;
                    const allRemarks = team.Remark ?? [];
                    const judgeId = session?.user?.id;

                    return (
                      <CarouselItem key={team.id}>
                        {/* Enhanced Card Styling */}
                        <Card className="h-[75vh] overflow-hidden rounded-lg border border-border bg-card shadow-lg md:h-[75vh]"> {/* Slightly reduced height */}
                          <CardContent className="flex h-full flex-col items-center justify-between p-4 md:p-6 lg:p-8">
                            {/* Add class for tutorial target */}
                            <div className="team-info-header flex w-full flex-col items-center justify-center gap-3 border-b border-border pb-4 md:gap-4 md:pb-6">
                              {/* Top Row: Team Name and Track */}
                              <div className="flex w-full flex-col items-center gap-2 md:flex-row md:items-start md:justify-between">
                                 {/* Left: Team Name and Number */}
                                 <div className="flex flex-col items-center text-center md:items-start md:text-left">
                                   <h1 className="w-full truncate text-center text-2xl font-bold text-foreground md:text-left md:text-3xl lg:text-5xl"> {/* Adjust font size for mobile */}
                                     {team.name}
                                   </h1>
                                   <span className="mt-1 text-xs font-medium text-primary md:text-sm">Team #{team.teamNo}</span> {/* Adjust font size for mobile */}
                                 </div>
                                 {/* Right: Track */}
                                <div className="flex flex-shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground md:px-3 md:py-1 md:text-sm"> {/* Adjust font size and padding for mobile */}
                                  <Info className="h-3 w-3 md:h-4 md:w-4" />
                                  <span className="hidden sm:inline">Track:</span> {team.IdeaSubmission?.track.replace(/_/g, ' ') ?? 'N/A'} {/* Shorten "Track:" on mobile */}
                                </div>
                              </div>

                              {/* Bottom Row: Team Members */}
                              <div className="flex w-full flex-wrap items-start justify-center gap-x-3 gap-y-2 pt-2 md:gap-x-4 md:pt-4"> {/* Adjust gap and padding for mobile */}
                                  {team.Members.map((member) => (
                                    <div key={member.name} className="flex w-16 flex-col items-center text-center md:w-20"> {/* Adjust width and image size for mobile */}
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
                                      <span className="mt-1 w-full text-[10px] text-muted-foreground md:mt-1.5 md:text-xs">{member.name}</span> {/* Adjust font size for mobile */}
                                    </div>
                                  ))}
                              </div>
                            </div>

                            {/* Add class for tutorial target */}
                            <div className="judge-remarks-section flex h-auto max-h-[30%] w-full flex-col items-center justify-start overflow-y-auto py-3 md:max-h-[35%] md:py-4">
                              <h3 className="mb-2 text-base font-semibold text-foreground md:mb-3 md:text-lg">Judge Remarks</h3>
                              <div className="w-full space-y-2 rounded-lg border border-border bg-background/50 p-2 shadow-inner md:space-y-3 md:p-3">
                                {allRemarks.length > 0 ? (
                                  allRemarks.map((remarkEntry: RemarkWithJudge, remarkIdx) => { // Use RemarkWithJudge type here
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
                                {/* Handle case where remarks exist but all points are empty */}
                                {allRemarks.length > 0 && allRemarks.every(r => !r.remark || r.remark.split(REMARK_DELIMITER).every(p => p.trim() === '')) && (
                                  <p className="flex h-full items-center justify-center text-center text-xs text-muted-foreground md:text-sm">
                                    No remarks were found for this team.
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Add class for tutorial target */}
                            <div className="progress-control-section flex h-auto w-full flex-col items-center justify-center gap-4 pt-4 md:gap-6 md:pt-8"> {/* Adjust gap and padding for mobile */}
                               <h3 className="mb-2 text-xl font-semibold text-foreground md:mb-4 md:text-2xl lg:text-3xl">Manage Team Progress</h3> {/* Adjust font size and margin for mobile */}
                               {/* Add class for tutorial target */}
                               <Button
                                 onClick={() => handleProgressChange(team.id, TeamProgress.TOP15)}
                                 disabled={isTop15 || changeProgress.isLoading}
                                 className={`promote-button w-48 transform rounded-lg px-4 py-2 text-sm font-medium shadow-md transition duration-200 ease-in-out hover:scale-105 md:w-56 md:px-6 md:py-3 md:text-base ${ // Adjust size, padding, text size for mobile
                                   isTop15
                                     ? 'cursor-not-allowed bg-green-600 text-white opacity-70'
                                     : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                                 }`}
                               >
                                 {isTop15 ? <CheckCircle className="mr-1 h-4 w-4 md:mr-2 md:h-5 md:w-5" /> : <ArrowUpCircle className="mr-1 h-4 w-4 md:mr-2 md:h-5 md:w-5" />}
                                 {isTop15 ? 'Currently Top 15' : 'Promote to Top 15'}
                               </Button>

                               {/* Add class for tutorial target */}
                               <Button
                                 onClick={() => handleProgressChange(team.id, TeamProgress.SELECTED)}
                                 disabled={isSelected || changeProgress.isLoading}
                                 variant={isSelected ? "outline" : "destructive"} // Adjusted variant
                                 className={`demote-button w-48 transform rounded-lg px-4 py-2 text-sm font-medium shadow-md transition duration-200 ease-in-out hover:scale-105 md:w-56 md:px-6 md:py-3 md:text-base ${ // Adjust size, padding, text size for mobile
                                   isSelected
                                     ? 'cursor-not-allowed border-muted text-muted-foreground opacity-70'
                                     : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                 }`}
                               >
                                 {isSelected ? <Circle className="mr-1 h-4 w-4 md:mr-2 md:h-5 md:w-5" /> : <ArrowDownCircle className="mr-1 h-4 w-4 md:mr-2 md:h-5 md:w-5" />}
                                 {isSelected ? 'Currently Selected' : 'Demote to Top 60'}
                               </Button>

                               {/* Loading indicator */}
                               {changeProgress.isLoading && changeProgress.variables?.teamId === team.id && (
                                   <div className="mt-2 flex items-center text-xs text-muted-foreground md:mt-4 md:text-sm"> {/* Adjust margin and text size for mobile */}
                                       <Spinner size="small" />
                                       <span className="ml-2 animate-pulse">Updating status...</span> {/* Added animation */}
                                   </div>
                               )}
                            </div>
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
          ) : (
             // Message when no teams match filters
             <div className="flex flex-grow items-center justify-center">
                 <p className="text-xl text-muted-foreground">No teams match the current filter or search.</p>
             </div>
          )}
        </div>
      )}
       {/* Message when initial fetch is successful but returns no teams */}
       {teamsQuery.isSuccess && teams.length === 0 && (
           <div className="flex h-screen w-screen items-center justify-center">
               <p className="text-xl text-gray-500">No teams available for final selection at this stage.</p>
           </div>
       )}
    </>
  );
}
