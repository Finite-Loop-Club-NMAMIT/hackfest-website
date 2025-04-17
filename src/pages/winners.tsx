import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { motion } from "framer-motion";
import RootLayout from "~/components/layout";
import Confetti from "react-dom-confetti";

const WinnerCard = ({
  title,
  team,
  highlight = false,
}: {
  title: string;
  team: {
    name: string;
    Members: { name: string | null; College: { name: string } | null }[];
  };
  highlight?: boolean;
}) => {
  const collegeName = team.Members[0]?.College?.name ?? "Unknown College";
  return (
    <motion.div
      className={`p-6 rounded-lg shadow-lg ${
        highlight
          ? "bg-gradient-to-b from-blue-950/80 to-indigo-950/90 text-white"
          : "bg-gradient-to-b from-black/60 to-black/90 text-gray-300"
      }`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <h3 className="text-xl font-semibold">{team.name}</h3>
      <p className="mt-2 text-sm italic text-gray-400">{collegeName}</p>
      <ul className="mt-2 space-y-1">
        {team.Members.map((member, idx) => (
          <li key={idx} className="text-sm">
            {member.name ?? "Unknown Member"}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

const TrackWinnerCard = ({
  track,
  team,
}: {
  track: string;
  team: {
    name: string;
    Members: { name: string | null; College: { name: string } | null }[];
  };
}) => {
  const collegeName = team.Members[0]?.College?.name ?? "Unknown College";
  return (
    <motion.div
      className="p-4 rounded-lg shadow-md bg-gradient-to-b from-black/60 to-black/90 text-gray-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h4 className="text-lg font-bold">{track.replace(/_/g, " ")}</h4>
      <h5 className="text-md font-semibold">{team.name}</h5>
      <p className="mt-2 text-sm italic text-gray-400">{collegeName}</p>
      <ul className="mt-2 space-y-1">
        {team.Members.map((member, idx) => (
          <li key={idx} className="text-sm">
            {member.name ?? "Unknown Member"}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default function WinnersPage() {
  const { data: isWinnersDeclared, isLoading: isWinnersLoading } =
    api.appSettings.isWinnersDeclared.useQuery();
  const { data, isLoading, error } = api.organiser.getTeamWinners.useQuery(undefined, {
    enabled: !!isWinnersDeclared,
  });

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
    colors: ["#f00", "#0f0", "#00f", "#FFC700", "#FF0000", "#2E3191", "#41BBC7"],
  };

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (data?.teams) setShowConfetti(true);
  }, [data?.teams]);

  if (isWinnersLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  if (!isWinnersDeclared) {
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
                  Results Not Declared Yet
                </span>
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
            <p className="mt-4 text-white/80">
              Please check back soon for the competition results!
            </p>
          </motion.div>
        </div>
      </RootLayout>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <h3 className="font-bold">Error loading winners</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  const winner = data?.teams.find((team) => team.teamProgress === "WINNER");
  const runnerUp = data?.teams.find((team) => team.teamProgress === "RUNNER");
  const secondRunnerUp = data?.teams.find(
    (team) => team.teamProgress === "SECOND_RUNNER"
  );

  const trackWinners = data?.teams.filter(
    (team) => team.teamProgress === "TRACK"
  );

  return (
    <RootLayout>
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-[#060e3c] via-[#052d4f] to-[#001933] py-10 text-center pt-16 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-4 pb-6 pt-12 md:pt-20 mt-4 md:mt-10 px-4"
        >
          <div className="text-3xl md:text-4xl lg:text-6xl font-bold">
            🎉 Competition Winners 🎉
          </div>
          <div className="mx-auto max-w-2xl px-4 text-base md:text-lg opacity-80">
            Congratulations to all the winners!
          </div>
        </motion.div>

        <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center pointer-events-none z-10">
          <Confetti active={showConfetti} config={config} />
        </div>

        <div className="flex flex-col gap-12 px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {winner && <WinnerCard title="🏆 Winner" team={winner} highlight={true} />}
            {runnerUp && <WinnerCard title="🥈 Runner-Up" team={runnerUp} />}
            {secondRunnerUp && <WinnerCard title="🥉 Second Runner-Up" team={secondRunnerUp} />}
          </div>

          <h2 className="text-2xl font-bold mb-6">Track Winners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trackWinners?.map((team, idx) => (
              <TrackWinnerCard
                key={idx}
                track={team.IdeaSubmission?.track ?? "Unknown Track"}
                team={team}
              />
            ))}
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
