import { useState, useEffect, useMemo } from "react";
import { api } from "~/utils/api";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import type { JudgeType } from "@prisma/client";
import { TeamProgress, type Tracks } from "@prisma/client";
import toast from "react-hot-toast";

type CriteriaType = {
  id: string;
  criteria: string;
  maxScore: number;
  JudgeType: JudgeType;
};

type JudgeUser = {
  name: string | null;
  id?: string;
};

type JudgeInfo = {
  id: string;
  type: JudgeType;
  tutorialShown: boolean;
  User: JudgeUser[];
};

type ScoreItem = {
  judgeId: string;
  criteriaId: string;
  score: number;
  Judge: JudgeInfo;
  Criteria: CriteriaType;
  teamId: string;
  id: number;
  createdAt?: Date;
  updatedAt?: Date;
};

type TeamRemark = {
  judgeId: string;
  remark: string;
  Judge: {
    User: Array<{ name: string | null, id?: string }>;
    type: JudgeType;
    id: string;
  };
  teamId: string;
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

interface TeamType {
  id: string;
  name: string;
  teamNo: number;
  teamProgress: string;
  Members: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    College?: {
      name: string;
    };
  }[];
  Scores: ScoreItem[];
  Remark: TeamRemark[];
  IdeaSubmission?: {
    track: Tracks;
    pptUrl: string;
  };
}

const ScoreCard = ({
  label,
  score,
  maxScore,
  className = "",
}: {
  label: string;
  score: number | string;
  maxScore?: number;
  className?: string;
}) => {
  return (
    <div
      className={`p-2 rounded-lg text-center border border-gray-600 ${className}`}
    >
      <div className="text-xs text-gray-300 truncate max-w-[80px]">
        {label}
      </div>
      <div className="text-lg font-semibold">
        {score}
        {maxScore ? (
          <span className="text-xs text-gray-400">/{maxScore}</span>
        ) : null}
      </div>
    </div>
  );
};

const JudgeTypeLabel = ({ type }: { type: string }) => {
  const typeLabels: Record<string, string> = {
    DAY2_ROUND1: "Day 2 Round 1",
    DAY2_ROUND2: "Day 2 Round 2",
    DAY3_FINALS: "Day 3 Finals",
    VALIDATOR: "Validator",
    SUPER_VALIDATOR: "Super Validator",
    REMARK: "Remark",
    DAY1: "Day 1",
    DAY2: "Day 2",
    DAY3: "Day 3",
  };

  return (
    <span className="px-2 py-1 text-xs rounded-md border border-gray-600">
      {typeLabels[type] ?? type}
    </span>
  );
};

const ActionButton = ({
  onClick,
  children,
  variant = "primary",
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
}) => {
  const baseStyle =
    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none";

  const variantStyles = {
    primary:
      "border border-blue-500 hover:border-blue-400 text-blue-400 hover:text-blue-300",
    secondary:
      "border border-purple-500 hover:border-purple-400 text-purple-400 hover:text-purple-300",
    outline:
      "border border-gray-600 hover:border-white text-gray-300 hover:text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variantStyles[variant]} flex items-center gap-2`}
    >
      {children}
    </button>
  );
};

const RemarksModal = ({
  isOpen,
  closeModal,
  remarks,
  teamName,
}: {
  isOpen: boolean;
  closeModal: () => void;
  remarks: TeamRemark[];
  teamName: string;
}) => {
  const remarksByType: Record<string, TeamRemark[]> = {};

  remarks.forEach((remark) => {
    const judgeType = remark.Judge.type;
    if (!remarksByType[judgeType]) {
      remarksByType[judgeType] = [];
    }
    remarksByType[judgeType].push(remark);
  });

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-70" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg border border-gray-700 p-6 text-left align-middle shadow-xl transition-all bg-gray-900/95 backdrop-blur-sm">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold leading-6 text-gray-100 mb-5"
                >
                  Remarks for {teamName}
                </Dialog.Title>

                <div className="mt-2 max-h-[70vh] overflow-y-auto">
                  {remarks.length === 0 ? (
                    <div className="py-4 text-center text-gray-400">
                      No remarks available for this team
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(remarksByType).length > 0 ? (
                        Object.entries(remarksByType).map(
                          ([judgeType, typeRemarks]) => (
                            <div key={judgeType}>
                              <div className="space-y-4">
                                {typeRemarks.map((remarkItem, idx) => (
                                  <div
                                    key={idx}
                                    className="border border-gray-700 p-4 rounded-lg bg-gray-800/80"
                                  >
                                    <div className="font-medium text-blue-400 mb-1">
                                      {remarkItem.Judge.User[0]?.name ??
                                        "Unknown Judge"}
                                    </div>
                                    <p className="text-gray-300 whitespace-pre-wrap">
                                      {remarkItem.remark}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <div className="space-y-4">
                          {remarks.map((remarkItem, idx) => (
                            <div
                              key={idx}
                              className="border border-gray-700 p-4 rounded-lg bg-gray-800/80"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium text-blue-400">
                                  {remarkItem.Judge.User[0]?.name ??
                                    "Unknown Judge"}
                                </div>
                                {remarkItem.Judge.type && (
                                  <JudgeTypeLabel
                                    type={remarkItem.Judge.type}
                                  />
                                )}
                              </div>
                              <p className="text-gray-300 whitespace-pre-wrap">
                                {remarkItem.remark}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border bg-white border-gray-600 px-4 py-2 text-sm font-medium hover:border-white focus:outline-none"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const CollapsibleSection = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 text-md font-medium mb-3 text-gray-300 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </div>
        <div
          className={`transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      <div
        className={`transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

// Track options for filtering
const trackOptions = [
  { value: "ALL", label: "All Tracks" },
  { value: "FINTECH", label: "FinTech" },
  { value: "SUSTAINABLE_DEVELOPMENT", label: "Sustainable Development" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "LOGISTICS", label: "Logistics" },
  { value: "OPEN_INNOVATION", label: "Open Innovation" },
];

// Update the TeamProgressActions component to respect winner constraints
const TeamProgressActions = ({
  team,
  onProgressChange,
  showExtendedOptions = false,
  hasWinner = false,
  hasRunner = false,
  hasSecondRunner = false,
  trackWinners = {},
}: {
  team: TeamType;
  onProgressChange: (success: boolean) => void;
  showExtendedOptions?: boolean;
  hasWinner?: boolean;
  hasRunner?: boolean;
  hasSecondRunner?: boolean;
  trackWinners?: Record<string, boolean>;
}) => {
  const isTop15 = team.teamProgress === "TOP15";
  const isSelected = team.teamProgress === "SELECTED";
  const isWinner = team.teamProgress === "WINNER";
  const isRunner = team.teamProgress === "RUNNER";
  const isSecondRunner = team.teamProgress === "SECOND_RUNNER";
  const isTrack = team.teamProgress === "TRACK";
  
  // Check if this track already has a winner
  const hasTrackWinner = team.IdeaSubmission?.track 
    ? trackWinners[team.IdeaSubmission.track] && team.teamProgress !== "TRACK"
    : false;

  const updateProgress = api.organiser.updateTeamProgressFromScoring.useMutation({
    onSuccess: () => {
      onProgressChange(true);
    },
    onError: (error) => {
      console.error("Error updating team progress:", error);
      onProgressChange(false);
    }
  });

  // For TOP15 teams, allow promoting to winner categories
  if (isTop15 && showExtendedOptions) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="text-xs font-medium text-gray-400 mb-1">Promote to Winner Category</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateProgress.mutate({
              teamId: team.id,
              progress: TeamProgress.WINNER
            })}
            disabled={isWinner || updateProgress.isLoading || (hasWinner && !isWinner)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
              isWinner || (hasWinner && !isWinner)
                ? "bg-yellow-900/30 text-yellow-300 border border-yellow-700 cursor-not-allowed opacity-60"
                : "bg-yellow-900/30 text-yellow-400 border border-yellow-500 hover:bg-yellow-800/40 hover:border-yellow-400"
            }`}
            title={hasWinner && !isWinner ? "There can only be one overall winner" : ""}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {isWinner ? "Winner" : (hasWinner && !isWinner) ? "Already has Winner" : "Winner"}
          </button>
          <button
            onClick={() => updateProgress.mutate({
              teamId: team.id,
              progress: TeamProgress.RUNNER
            })}
            disabled={isRunner || updateProgress.isLoading || (hasRunner && !isRunner)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
              isRunner || (hasRunner && !isRunner)
                ? "bg-indigo-900/30 text-indigo-300 border border-indigo-700 cursor-not-allowed opacity-60"
                : "bg-indigo-900/30 text-indigo-400 border border-indigo-500 hover:bg-indigo-800/40 hover:border-indigo-400"
            }`}
            title={hasRunner && !isRunner ? "There can only be one runner-up" : ""}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
            </svg>
            {isRunner ? "Runner-Up" : (hasRunner && !isRunner) ? "Already has Runner-Up" : "Runner-Up"}
          </button>
          <button
            onClick={() => updateProgress.mutate({
              teamId: team.id,
              progress: TeamProgress.SECOND_RUNNER
            })}
            disabled={isSecondRunner || updateProgress.isLoading || (hasSecondRunner && !isSecondRunner)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
              isSecondRunner || (hasSecondRunner && !isSecondRunner)
                ? "bg-purple-900/30 text-purple-300 border border-purple-700 cursor-not-allowed opacity-60"
                : "bg-purple-900/30 text-purple-400 border border-purple-500 hover:bg-purple-800/40 hover:border-purple-400"
            }`}
            title={hasSecondRunner && !isSecondRunner ? "There can only be one 2nd runner-up" : ""}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
            </svg>
            {isSecondRunner ? "2nd Runner-Up" : (hasSecondRunner && !isSecondRunner) ? "Already has 2nd Runner-Up" : "2nd Runner-Up"}
          </button>
          <button
            onClick={() => updateProgress.mutate({
              teamId: team.id,
              progress: TeamProgress.TRACK
            })}
            disabled={isTrack || updateProgress.isLoading || hasTrackWinner}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
              isTrack || hasTrackWinner
                ? "bg-emerald-900/30 text-emerald-300 border border-emerald-700 cursor-not-allowed opacity-60"
                : "bg-emerald-900/30 text-emerald-400 border border-emerald-500 hover:bg-emerald-800/40 hover:border-emerald-400"
            }`}
            title={hasTrackWinner ? `This track already has a winner` : ""}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            {isTrack ? "Track Winner" : hasTrackWinner ? `Track has Winner` : "Track Winner"}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateProgress.mutate({
              teamId: team.id,
              progress: TeamProgress.SELECTED
            })}
            disabled={updateProgress.isLoading}
            className="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all duration-200 bg-red-900/30 text-red-400 border border-red-500 hover:bg-red-800/40 hover:border-red-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Demote to SELECTED
          </button>
        </div>
      </div>
    );
  }
  
  // For other teams in SELECTED/TOP15 with basic options
  if ((isSelected || isTop15) && !showExtendedOptions) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateProgress.mutate({
            teamId: team.id,
            progress: TeamProgress.TOP15
          })}
          disabled={isTop15 || updateProgress.isLoading}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-all duration-200 ${
            isTop15
              ? "bg-green-900/30 text-green-400 border border-green-700 cursor-not-allowed opacity-60"
              : "bg-blue-900/30 text-blue-400 border border-blue-500 hover:bg-blue-800/40 hover:border-blue-400"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          {isTop15 ? "TOP 15" : "Promote to TOP 15"}
        </button>
        
        <button
          onClick={() => updateProgress.mutate({
            teamId: team.id,
            progress: TeamProgress.SELECTED
          })}
          disabled={isSelected || updateProgress.isLoading}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-all duration-200 ${
            isSelected
              ? "bg-gray-800/70 text-gray-400 border border-gray-700 cursor-not-allowed opacity-60"
              : "bg-red-900/30 text-red-400 border border-red-500 hover:bg-red-800/40 hover:border-red-400"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {isSelected ? "SELECTED" : "Demote to SELECTED"}
        </button>
      </div>
    );
  }
  
  // For teams with winner statuses that are not in TOP15 filter
  if ([isWinner, isRunner, isSecondRunner, isTrack].some(status => status) && !showExtendedOptions) {
    const statusLabel = isWinner ? "WINNER" : 
                       isRunner ? "RUNNER-UP" : 
                       isSecondRunner ? "2nd RUNNER-UP" : 
                       "TRACK WINNER";
    
    return (
      <div className="flex items-center gap-2">
        <span className="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 bg-amber-900/30 text-amber-400 border border-amber-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {statusLabel}
        </span>
        <button
          onClick={() => updateProgress.mutate({
            teamId: team.id,
            progress: TeamProgress.TOP15
          })}
          disabled={updateProgress.isLoading}
          className="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all duration-200 bg-red-900/30 text-red-400 border border-red-500 hover:bg-red-800/40 hover:border-red-400"
        >
          Demote to TOP15
        </button>
      </div>
    );
  }
  
  return null;
};

export default function ScoreTab() {
  const [selectedTeamRemarks, setSelectedTeamRemarks] = useState<{
    teamName: string;
    remarks: TeamRemark[];
  } | null>(null);

  // Add search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<string>("ALL");
  // Use BOTH as default filter to show all teams
  const [progressFilter, setProgressFilter] = useState<string>("BOTH");

  // Add states to track winner selections
  const [hasWinner, setHasWinner] = useState(false);
  const [hasRunner, setHasRunner] = useState(false);
  const [hasSecondRunner, setHasSecondRunner] = useState(false);
  const [trackWinners, setTrackWinners] = useState<Record<string, boolean>>({});

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data, isLoading, error, refetch } = api.organiser.getTeamScores.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      refetchOnMount: refreshTrigger > 0,
    }
  );

  // Calculate team statistics and check existing winners
  useEffect(() => {
    if (data?.teams) {
      // Use direct string comparison for more reliable matching
      const winnerTeam = (data.teams as TeamType[]).find(t => t.teamProgress === "WINNER");
      const runnerTeam = (data.teams as TeamType[]).find(t => t.teamProgress === "RUNNER");
      const secondRunnerTeam = (data.teams as TeamType[]).find(t => t.teamProgress === "SECOND_RUNNER");
      
      console.log("Winner detection:", { 
        teamsCount: data.teams.length,
        winnerExists: !!winnerTeam, 
        winnerTeam: winnerTeam?.name,
        winnerProgress: winnerTeam?.teamProgress,
        allProgress: (data.teams as TeamType[]).map(t => t.teamProgress).join(', ')
      });
      
      setHasWinner(!!winnerTeam);
      setHasRunner(!!runnerTeam);
      setHasSecondRunner(!!secondRunnerTeam);
      
      // Track winners by track
      const trackWinnersMap: Record<string, boolean> = {};
      (data.teams as TeamType[]).forEach(team => {
        if (team.teamProgress === "TRACK" && team.IdeaSubmission?.track) {
          trackWinnersMap[team.IdeaSubmission.track] = true;
        }
      });
      setTrackWinners(trackWinnersMap);
    }
  }, [data?.teams]);

  const showRemarks = (teamName: string, remarks: TeamRemark[]) => {
    if (remarks) {
      setSelectedTeamRemarks({ teamName, remarks });
    }
  };

  const closeRemarksModal = () => {
    setSelectedTeamRemarks(null);
  };

  const organizeScoresByJudge = (scores: ScoreItem[]) => {
    const judgeScores: Record<
      string,
      {
        judgeName: string;
        judgeType: string;
        scores: Record<string, number>;
        total: number;
        minScore: number;
        maxScore: number;
      }
    > = {};

    scores.forEach((score) => {
      const judgeId = score.judgeId;
      const judgeName = score.Judge.User[0]?.name ?? "Unknown";
      const criteriaId = score.criteriaId;
      const judgeType = score.Judge.type;

      if (!judgeScores[judgeId]) {
        judgeScores[judgeId] = {
          judgeName,
          judgeType,
          scores: {},
          total: 0,
          minScore: Infinity,
          maxScore: -Infinity,
        };
      }

      judgeScores[judgeId].scores[criteriaId] = score.score;
      judgeScores[judgeId].total += score.score;

      judgeScores[judgeId].minScore = Math.min(
        judgeScores[judgeId].minScore,
        score.score
      );
      judgeScores[judgeId].maxScore = Math.max(
        judgeScores[judgeId].maxScore,
        score.score
      );
    });

    return judgeScores;
  };

  const groupJudgesByType = (
    judges: Record<
      string,
      {
        judgeName: string;
        judgeType: string;
        scores: Record<string, number>;
        total: number;
        minScore: number;
        maxScore: number;
      }
    >
  ) => {
    const judgesByType: Record<string, typeof judges> = {};

    Object.entries(judges).forEach(([judgeId, judgeData]) => {
      const judgeType = judgeData.judgeType;

      if (!judgesByType[judgeType]) {
        judgesByType[judgeType] = {};
      }

      judgesByType[judgeType][judgeId] = judgeData;
    });

    return judgesByType;
  };

  const normalizeJudgeScores = (
    judgeScores: Record<
      string,
      {
        judgeName: string;
        judgeType: string;
        scores: Record<string, number>;
        total: number;
        minScore: number;
        maxScore: number;
      }
    >
  ) => {
    const normalizedScores: Record<
      string,
      { rawTotal: number; normalizedTotal: number }
    > = {};

    let overallRawTotal = 0;
    let overallMaxPossibleRaw = 0;
    let overallNormalizedTotal = 0;
    let judgeCount = 0;

    Object.entries(judgeScores).forEach(([judgeId, data]) => {
      const scoreRange = data.maxScore - data.minScore;
      let normalizedTotal = 0;

      if (scoreRange > 0) {
        normalizedTotal = Math.round(
          ((data.total - data.minScore * Object.keys(data.scores).length) /
            (scoreRange * Object.keys(data.scores).length)) *
            100
        );
      } else if (data.maxScore > 0) {
        normalizedTotal = 100;
      } else {
        normalizedTotal = 0;
      }

      normalizedScores[judgeId] = {
        rawTotal: data.total,
        normalizedTotal: normalizedTotal,
      };

      overallRawTotal += data.total;
      const criteriaCount = Object.keys(data.scores).length;
      overallMaxPossibleRaw += data.maxScore * criteriaCount;
      overallNormalizedTotal += normalizedTotal;
      judgeCount++;
    });

    const overallNormalizedPercentage =
      judgeCount > 0 ? Math.round(overallNormalizedTotal / judgeCount) : 0;

    const overallRawPercentage =
      overallMaxPossibleRaw > 0
        ? Math.round((overallRawTotal / overallMaxPossibleRaw) * 100)
        : 0;

    return {
      judgeScores: normalizedScores,
      overallRawTotal,
      overallRawPercentage,
      overallNormalizedTotal,
      overallNormalizedPercentage,
    };
  };

  // Calculate team statistics
  const teamStats = useMemo(() => {
    if (!data?.teams) return {
      selected: 0,
      top15: 0,
      winner: 0,
      runner: 0,
      secondRunner: 0,
      track: 0,
      trackBreakdown: {} as Record<string, number>
    };
    
    const stats = {
      selected: 0,
      top15: 0,
      winner: 0,
      runner: 0,
      secondRunner: 0,
      track: 0,
      trackBreakdown: {} as Record<string, number>
    };
    
    // Add debug logging to inspect team progress values
    console.log("Team progress values:", (data.teams as TeamType[]).map(team => ({
      name: team.name,
      progress: team.teamProgress
    })));
    
    // Use explicit enum string values to ensure proper matching
    (data.teams as TeamType[]).forEach(team => {
      if (team.teamProgress === "SELECTED") stats.selected++;
      else if (team.teamProgress === "TOP15") stats.top15++;
      else if (team.teamProgress === "WINNER") stats.winner++;
      else if (team.teamProgress === "RUNNER") stats.runner++;
      else if (team.teamProgress === "SECOND_RUNNER") stats.secondRunner++;
      else if (team.teamProgress === "TRACK") {
        stats.track++;
        
        // Count by track
        const trackName = team.IdeaSubmission?.track ?? "UNKNOWN";
        if (!stats.trackBreakdown[trackName]) {
          stats.trackBreakdown[trackName] = 0;
        }
        stats.trackBreakdown[trackName]++;
      }
    });
    
    // Log final statistics for debugging
    console.log("Calculated team statistics:", stats);
    
    return stats;
  }, [data?.teams]);

  const handleProgressChange = (success: boolean) => {
    if (success) {
      setRefreshTrigger((prev) => prev + 1);
      void refetch();
      toast("Team progress updated successfully", {
        duration: 3000,
        position: "top-center",
        style: { background: "#10B981", color: "white" },
      });
    } else {
      toast("Failed to update team progress", {
        duration: 3000,
        position: "top-center",
        style: { background: "#EF4444", color: "white" },
      });
    }
  };

  // Filter teams based on search query, selected track, and progress filter
  const filterTeams = (teams: TeamType[]): TeamType[] => {
    if (!teams) return [];

    return teams.filter((team) => {
      // Filter by search query (team name or team number)
      const matchesSearch =
        searchQuery === "" ||
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.teamNo.toString().includes(searchQuery);

      // Filter by track
      const matchesTrack =
        selectedTrack === "ALL" ||
        (team.IdeaSubmission && team.IdeaSubmission.track === selectedTrack);

      // Filter by progress, including all types of winners in "BOTH" filter
      const matchesProgress =
        progressFilter === "BOTH" ||
        team.teamProgress === progressFilter;

      return matchesSearch && matchesTrack && matchesProgress;
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="border border-red-500 text-red-200 p-4 rounded-lg">
          <h3 className="font-bold">Error loading scores</h3>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  const { teams, criteria } = data || { teams: [], criteria: [] };

  // Apply filters to teams
  const filteredTeams = filterTeams(teams as TeamType[]);

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-semibold mb-6">Jury Scoring Dashboard</h2>

      {/* Team Statistics Summary - Removed colors */}
      <div className="mb-6 border border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-3 text-gray-200">Team Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-sm text-gray-400">SELECTED</div>
            <div className="text-2xl font-bold text-gray-100">{teamStats.selected}</div>
          </div>
          <div className="border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-sm text-blue-400">TOP 15</div>
            <div className="text-2xl font-bold text-gray-100">{teamStats.top15}</div>
          </div>
          <div className="border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-sm text-yellow-400">WINNER</div>
            <div className="text-2xl font-bold text-gray-100">{teamStats.winner}</div>
          </div>
          <div className="border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-sm text-indigo-400">RUNNER-UP</div>
            <div className="text-2xl font-bold text-gray-100">{teamStats.runner}</div>
          </div>
          <div className="border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-sm text-purple-400">2ND RUNNER-UP</div>
            <div className="text-2xl font-bold text-gray-100">{teamStats.secondRunner}</div>
          </div>
          <div className="border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-sm text-emerald-400">TRACK WINNERS</div>
            <div className="text-2xl font-bold text-gray-100">{teamStats.track}</div>
          </div>
        </div>
        
        {/* Track Winner Breakdown - Removed colors */}
        {Object.keys(teamStats.trackBreakdown).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2 text-gray-300">Track Winner Breakdown:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(teamStats.trackBreakdown).map(([track, count]) => (
                <div key={track} className="border border-gray-700 rounded-full px-3 py-1 text-xs">
                  <span className="text-emerald-400">{track.replace(/_/g, ' ')}:</span> {count}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Search Box */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            className="bg-gray-800 border border-gray-700 text-white pl-10 py-2 px-4 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by team name or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Progress Filter dropdown */}
        <div className="md:w-60">
          <select
            className="bg-gray-800 border border-gray-700 text-white py-2 px-4 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={progressFilter}
            onChange={(e) => setProgressFilter(e.target.value)}
          >
            <option value="BOTH">All Teams</option>
            <option value="SELECTED">SELECTED Teams</option>
            <option value="TOP15">TOP 15 Teams</option>
            <option value="WINNER">Winners</option>
            <option value="RUNNER">Runners-Up</option>
            <option value="SECOND_RUNNER">2nd Runners-Up</option>
            <option value="TRACK">Track Winners</option>
          </select>
        </div>

        {/* Track Filter dropdown */}
        <div className="md:w-60">
          <select
            className="bg-gray-800 border border-gray-700 text-white py-2 px-4 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
          >
            {trackOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search results count */}
      <div className="mb-4 text-sm text-gray-400">
        Showing {filteredTeams.length} of {teams.length} teams
      </div>

      {teams.length === 0 ? (
        <div className="border border-gray-700 p-6 rounded-lg text-center text-gray-400">
          <p>No teams with SELECTED or TOP15 status found.</p>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="border border-gray-700 p-6 rounded-lg text-center text-gray-400">
          <p>No teams match your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredTeams.map((team: TeamType) => {
            const judgeScores = organizeScoresByJudge(team.Scores);
            const judgesByType = groupJudgesByType(judgeScores);
            const {
              judgeScores: normalizedJudgeScores,
              overallRawTotal,
              overallRawPercentage,
              overallNormalizedTotal,
            } = normalizeJudgeScores(judgeScores);

            // Check if we should show extended options (only for TOP15 filter)
            const showExtendedOptions = progressFilter === "TOP15" && team.teamProgress === "TOP15";
            
            return (
              <div
                key={team.id}
                className="border border-gray-700 rounded-lg overflow-hidden shadow-lg"
              >
                <div className="border-b border-gray-700 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center">
                      <div className="text-4xl">{team.name}</div>
                    </h3>
                    <div className="text-sm text-gray-400 flex items-center flex-wrap gap-2">
                      <span>
                        Team #{team.teamNo} •{" "}
                        <span className={`font-medium ${
                          team.teamProgress === "TOP15" ? "text-blue-400" :
                          team.teamProgress === "WINNER" ? "text-yellow-400" :
                          team.teamProgress === "RUNNER" ? "text-indigo-400" :
                          team.teamProgress === "SECOND_RUNNER" ? "text-purple-400" :
                          team.teamProgress === "TRACK" ? "text-emerald-400" :
                          "text-gray-400"
                        }`}>
                          {team.teamProgress}
                        </span>
                      </span>
                      <span className="text-xs border-l border-gray-600 pl-2">
                        {team.Members.length} Members
                      </span>
                      {team.IdeaSubmission && (
                        <span className="text-xs bg-gray-800 px-2 py-1 rounded-full border border-gray-600">
                          {team.IdeaSubmission.track.replace("_", " ")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <ScoreCard
                          label="Raw Score"
                          score={overallRawTotal}
                          className="border border-gray-600"
                        />
                        <ScoreCard
                          label="Raw %"
                          score={`${overallRawPercentage}%`}
                          className="border border-gray-600"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <ScoreCard
                          label="Normalized"
                          score={overallNormalizedTotal}
                          className="border border-gray-600"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {/* Show progress actions conditionally based on filter */}
                      {(progressFilter === "TOP15" || progressFilter === "SELECTED" || progressFilter === "BOTH" ||
                         ["WINNER", "RUNNER", "SECOND_RUNNER", "TRACK"].includes(progressFilter) && 
                         team.teamProgress === progressFilter) && (
                        <TeamProgressActions
                          team={team}
                          onProgressChange={handleProgressChange}
                          showExtendedOptions={showExtendedOptions}
                          hasWinner={hasWinner}
                          hasRunner={hasRunner}
                          hasSecondRunner={hasSecondRunner}
                          trackWinners={trackWinners}
                        />
                      )}
                      <div className="flex items-center">
                        <ActionButton
                          onClick={() => showRemarks(team.name, team.Remark)}
                          variant={
                            team.Remark.length > 0 ? "primary" : "outline"
                          }
                        >
                          {team.Remark.length > 0 ? (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>Show Remarks ({team.Remark.length})</span>
                            </>
                          ) : (
                            <span>No Remarks</span>
                          )}
                        </ActionButton>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <CollapsibleSection
                    title="Team Members"
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                    }
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {team.Members.map((member) => (
                        <div
                          key={member.id}
                          className="border border-gray-700 rounded-lg p-3"
                        >
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-blue-400 truncate">
                            <a
                              href={`mailto:${member.email}`}
                              className="hover:underline"
                            >
                              {member.email}
                            </a>
                          </div>
                          {member.phone && (
                            <div className="text-sm text-gray-400">
                              <a
                                href={`tel:${member.phone}`}
                                className="hover:underline"
                              >
                                {member.phone}
                              </a>
                            </div>
                          )}
                          {member.College && (
                            <div className="mt-1 text-xs text-gray-500">
                              {member.College.name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>

                  <h4 className="text-md font-medium mb-3 text-gray-300 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Score Breakdown
                  </h4>

                  <div className="space-y-6">
                    {Object.entries(judgesByType).map(([judgeType, judges]) => (
                      <div
                        key={judgeType}
                        className="border-t border-gray-700 pt-4 first:border-t-0 first:pt-0"
                      >
                        <div className="mb-3 flex items-center">
                          <JudgeTypeLabel type={judgeType} />
                        </div>

                        <div className="space-y-4">
                          {Object.entries(judges).map(([judgeId, data]) => (
                            <div
                              key={judgeId}
                              className="border border-gray-700 rounded-lg p-3"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="font-medium">
                                  {data.judgeName}
                                </div>
                                <div className="flex items-center space-x-3">
                                  <ScoreCard
                                    label="Raw Score"
                                    score={
                                      normalizedJudgeScores[judgeId]?.rawTotal ?? 0
                                    }
                                    className="border border-gray-600"
                                  />
                                  <ScoreCard
                                    label="Normalized"
                                    score={`${
                                      normalizedJudgeScores[judgeId]
                                        ?.normalizedTotal ?? 0
                                    }`}
                                    className="border border-gray-600"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-2">
                                {Object.entries(data.scores).map(
                                  ([criteriaId, score]) => {
                                    const criterion = criteria.find(
                                      (c) => c.id === criteriaId
                                    );
                                    return (
                                      <ScoreCard
                                        key={criteriaId}
                                        label={criterion?.criteria ?? "Unknown"}
                                        score={score}
                                        maxScore={criterion?.maxScore}
                                        className="border border-gray-600"
                                      />
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedTeamRemarks && (
        <RemarksModal
          isOpen={!!selectedTeamRemarks}
          closeModal={closeRemarksModal}
          remarks={selectedTeamRemarks.remarks}
          teamName={selectedTeamRemarks.teamName}
        />
      )}
    </div>
  );
}

