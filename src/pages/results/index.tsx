import { api } from "~/utils/api";
import RootLayout from "~/components/layout";
import Confetti from "react-dom-confetti";
import { useEffect, useState } from "react";
import Spinner from "~/components/spinner";
import { motion } from "framer-motion";
import { type Tracks } from "@prisma/client";

export default function Results() {
  // Use proper type assertion with the appSettings query
  const appSettings = api.appSettings.isResultOpen.useQuery();
  // Fix the unsafe assignment by using a type guard
  const isResultOpen = Boolean(appSettings.data ?? false);

  // Explicitly type the API returns
  const topTeamsQuery = api.team.getTop60Selected.useQuery(undefined, {
    enabled: isResultOpen, // Only fetch data when results are open
  });
  const topTeams = topTeamsQuery.data;

  const userQuery = api.user.getUserWithTeam.useQuery(undefined, {
    enabled: isResultOpen, // Only fetch user team data when results are open
  });
  const teamID = userQuery.data?.teamId;

  const config = {
    angle: 290,
    spread: 300,
    startVelocity: 40,
    elementCount: 70,
    dragFriction: 0.11,
    duration: 6000,
    stagger: 3,
    width: "10px",
    height: "14px",
    perspective: "503px",
    colors: [
      "#f00",
      "#0f0",
      "#00f",
      "#FFC700",
      "#FF0000",
      "#2E3191",
      "#41BBC7",
    ],
  };

  const [show, setShow] = useState(false);
  const [activeConfetti, setActiveConfetti] = useState<string | null>(null);

  const trackColors = {
    FINTECH: "text-blue-400 ",
    SUSTAINABLE_DEVELOPMENT: "text-green-400 ",
    HEALTHCARE: "text-rose-400 ",
    LOGISTICS: "text-amber-400 ",
    OPEN_INNOVATION: "text-purple-400 ",
    ALL: "text-slate-400 ",
  };

  const trackBg = {
    FINTECH: "bg-blue-500/5",
    SUSTAINABLE_DEVELOPMENT: "bg-green-500/5",
    HEALTHCARE: "bg-rose-500/5",
    LOGISTICS: "bg-amber-500/5",
    OPEN_INNOVATION: "bg-purple-500/5",
    ALL: "bg-slate-500/5",
  };

  const trackIcons = {
    FINTECH: "💰",
    SUSTAINABLE_DEVELOPMENT: "🌱",
    HEALTHCARE: "🏥",
    LOGISTICS: "🚚",
    OPEN_INNOVATION: "💡",
    ALL: "🏆",
  };

  const ConfettiExplosion = () => {
    setShow(true);
    setTimeout(() => setShow(false), 6000);
  };

  const handleTrackConfetti = (track: string) => {
    setActiveConfetti(track);
    setTimeout(() => setActiveConfetti(null), 2000);
  };

  useEffect(() => {
    if (topTeams) ConfettiExplosion();
  }, [topTeams]);

  // Group teams by track
  const teamsByTrack = topTeams?.reduce((acc, team) => {
    const track = team.IdeaSubmission?.track ?? "ALL";
    if (!acc[track]) {
      acc[track] = [];
    }
    acc[track].push(team);
    return acc;
  }, {} as Record<string, typeof topTeams>);

  // Order tracks 
  const trackOrder: Tracks[] = [
    "FINTECH", 
    "SUSTAINABLE_DEVELOPMENT", 
    "HEALTHCARE", 
    "LOGISTICS", 
    "OPEN_INNOVATION"
  ];

  // Check if results are open before continuing
  if (appSettings.isLoading) {
    return (
          <Spinner />
    );
  }

  // Show coming soon page if results are not open
  if (appSettings.data === false) {
    return (
      <RootLayout>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#060e3c] via-[#052d4f] to-[#001933] px-4 pt-16 md:pt-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative mb-8 mt-8 md:mt-0"
          >
            <div className="relative rounded-lg px-6 py-6 md:px-8 backdrop-blur-sm">
              <h1 className="relative text-3xl font-bold md:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-blue-300 via-white to-teal-300 bg-clip-text text-transparent">
                  Results Coming Soon
                </span>
                <div className="absolute -right-4 md:-right-6 -top-6 text-2xl animate-bounce">🎉</div>
                <div className="absolute -left-4 md:-left-6 bottom-0 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🚀</div>
              </h1>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-10 md:mb-12 max-w-md md:max-w-2xl text-lg md:text-xl px-4"
          >
            <p className="bg-gradient-to-r from-blue-400 via-white to-teal-400 bg-clip-text text-transparent font-medium">
              The Hackfest team is finalizing the results.
            </p>
            <p className="mt-4 text-white/80">Just a little more patience, we promise it&apos;ll be worth the wait!</p>
            <div className="mt-6 flex justify-center space-x-1 md:space-x-2">
              {["H", "A", "C", "K", "F", "E", "S", "T"].map((letter, i) => (
                <motion.span 
                  key={i}
                  initial={{ y: 0 }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    delay: i * 0.1,
                    ease: "easeInOut" 
                  }}
                  className="inline-block rounded bg-gradient-to-br from-blue-500 to-teal-500 px-1.5 md:px-2 py-1 text-xs md:text-sm font-bold shadow-lg"
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="relative"
          >
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 opacity-70 blur-md"></div>
            <div className="relative flex h-32 w-32 md:h-40 md:w-40 flex-col items-center justify-center rounded-full bg-gradient-to-b from-black/80 to-black/95 backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <div className="text-xl md:text-2xl font-bold text-white">Coming</div>
                <motion.div 
                  animate={{ 
                    rotate: 360, 
                    transition: { duration: 20, repeat: Infinity, ease: "linear" } 
                  }}
                  className="relative h-12 w-12 md:h-14 md:w-14 mt-1"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-lg md:text-xl">
                    ⏱️
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-10 md:mt-12 max-w-xs md:max-w-md text-center text-white/60 px-4"
          >
            <p>We&apos;re excited to announce the teams that will be joining us at NMAMIT for Hackfest 2025.</p>
            <p className="mt-4">Check back soon!</p>
          </motion.div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-[#060e3c] via-[#052d4f] to-[#001933] py-10 text-center pt-16 md:pt-24">
        {topTeams && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-4 pb-6 pt-12 md:pt-20 mt-4 md:mt-10 px-4"
          >
            <div className="text-3xl md:text-4xl lg:text-6xl font-bold">
              Congratulations!
            </div>
            <div className="mx-auto max-w-2xl px-4 text-base md:text-lg opacity-80">
              Here are the top teams selected for Hackfest 2025, See y&apos;all
              at NMAMIT!
            </div>
          </motion.div>
        )}
        
        {/* Position confetti in the middle of the screen */}
        <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center pointer-events-none z-10">
          <Confetti active={show} config={config} />
        </div>
        
        {!topTeams ? (
          <div className="absolute left-1/2 top-1/2 flex translate-x-[-50%] translate-y-[-50%] items-center justify-center gap-2 text-sm md:text-xl">
            <div className="whitespace-nowrap">Loading results...</div>
            <Spinner />
          </div>
        ) : (
          <div className="flex flex-col gap-12 px-4 py-8">
            {trackOrder.map((track, trackIndex) => (
              teamsByTrack?.[track] && teamsByTrack[track]?.length > 0 && (
                <motion.div 
                  key={track}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: trackIndex * 0.2 }}
                  className="relative"
                >
                  <div className="relative mb-6">
                    <motion.div 
                      className="relative"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleTrackConfetti(track)}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-2xl">{trackIcons[track as keyof typeof trackIcons]}</span>
                        <h2 className={`text-2xl font-bold tracking-tight md:text-3xl ${trackColors[track as keyof typeof trackColors].split(' ')[0]}`}>
                          {track.replace(/_/g, " ")}
                        </h2>
                      </div>
                      
                      {/* Center track confetti */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Confetti active={activeConfetti === track} config={config} />
                      </div>
                    </motion.div>
                  </div>

                  <motion.div 
                    className="mx-auto max-w-6xl overflow-hidden rounded-xl backdrop-blur-sm" 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 + trackIndex * 0.2 }}
                  >
                    <div className={`w-full h-1 ${trackBg[track as keyof typeof trackBg]}`}></div>
                    
                    {/* Apply flex layout with wrapping to center odd rows */}
                    <div className="flex flex-wrap justify-center gap-2 p-1"> 
                      {teamsByTrack[track]?.map((team, index) => {
                        
                        const columnWidth = "w-full sm:w-[calc(50%-1px)] md:w-[calc(33.333%-1px)] lg:w-[calc(25%-1px)]";
                        
                        return (
                          <motion.div
                            key={team.id}
                            className={`relative ${columnWidth} ${
                              teamID === team.id ? "ring-2 ring-blue-400 ring-inset rounded-xl" : ""
                            }`} // Added rounded-xl to the selected team ring
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.05 * index }}
                            whileHover={{ 
                              scale: 1.03, 
                              zIndex: 10, 
                              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                              transition: { duration: 0.2 } 
                            }}
                          >
                            <div className={`h-full w-full ${
                              teamID === team.id 
                              ? "bg-gradient-to-b from-blue-950/80 to-indigo-950/90 rounded-xl" // Added rounded-xl
                              : "bg-gradient-to-b from-black/60 to-black/90"
                            } p-4 backdrop-blur-sm`}>
                              <div className="flex h-full flex-col justify-between items-center text-center">
                                <div className="flex flex-col items-center">
                                  <h3 className="mb-1 text-lg font-bold">{team.name}</h3>
                                  <div className="mb-2 text-xs opacity-70">
                                    {team.Members[0]?.College?.name}
                                  </div>
                                </div>
                                
                                {teamID === team.id && (
                                  <div className="mt-auto rounded-full bg-blue-500/20 px-3 py-0.5 text-xs font-medium text-blue-300">
                                    Your Team
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )
            ))}
          </div>
        )}
        {topTeams && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mx-auto mt-10 max-w-4xl px-6 text-base opacity-70 md:px-20"
          >
            <p>
              It was hard for us to shortlist the top ideas, because of all the
              quality ideas we received. It was based on multiple criteria like
              innovation, creative features, relevance to track, market fit,
              feasibility, existing solution comparison etc.
            </p>
            <p className="mt-4">
              If your team didn&apos;t make it to top, don&apos;t worry, bounce back stronger
              at Hackfest 2026! See you there.
            </p>
          </motion.div>
        )}
      </div>
    </RootLayout>
  );
}