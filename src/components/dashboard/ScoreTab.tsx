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
  variant = "default"
}: {
  label: string;
  score: number | string;
  maxScore?: number;
  className?: string;
  variant?: "default" | "normalized";
}) => {
  return (
    <div
      className={`p-2 rounded-lg text-center border ${
        variant === "normalized" 
          ? "border-blue-600 bg-blue-900/20" 
          : "border-gray-600"
      } ${className}`}
    >
      <div className={`text-xs ${
        variant === "normalized" ? "text-blue-300" : "text-gray-300"
      } truncate max-w-[80px]`}>
        {label}
      </div>
      <div className={`text-lg font-semibold ${
        variant === "normalized" ? "text-blue-300" : ""
      }`}>
        {score}
        {maxScore ? (
          <span className="text-xs text-gray-400">/{maxScore}</span>
        ) : variant === "normalized" ? (
          <span className="text-xs text-blue-400">/10</span>
        ) : null}
      </div>
    </div>
  );
};

const JudgeScoreRange = ({
  minScore,
  maxScore,
}: {
  minScore: number;
  maxScore: number;
}) => {
  return (
    <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
      <span title="Lowest score given by this judge">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        {minScore}
      </span>
      <span className="mx-1">-</span>
      <span title="Highest score given by this judge">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        {maxScore}
      </span>
      <span className="ml-1 text-gray-500">range</span>
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

  // Function to process remarks with ";;;" delimiter
  const formatRemark = (remark: string) => {
    if (remark.includes(";;;")) {
      const points = remark.split(";;;").map(point => point.trim()).filter(point => point.length > 0);
      return (
        <ul className="list-disc pl-5 space-y-1">
          {points.map((point, idx) => (
            <li className="text-white" key={idx}>{point}</li>
          ))}
        </ul>
      );
    }
    return <p className="text-white whitespace-pre-wrap">{remark}</p>;
  };

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
                                    {formatRemark(remarkItem.remark)}
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
                              {formatRemark(remarkItem.remark)}
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
          {/* Only show winner button if there's no winner yet or this team is already the winner */}
          {(!hasWinner || isWinner) && (
            <button
              onClick={() => updateProgress.mutate({
                teamId: team.id,
                progress: TeamProgress.WINNER
              })}
              disabled={isWinner || updateProgress.isLoading}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
                isWinner
                  ? "bg-yellow-900/30 text-yellow-300 border border-yellow-700 cursor-not-allowed opacity-60"
                  : "bg-yellow-900/30 text-yellow-400 border border-yellow-500 hover:bg-yellow-800/40 hover:border-yellow-400"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {isWinner ? "Winner" : "Winner"}
            </button>
          )}
          
          {/* Only show runner-up button if there's no runner-up yet or this team is already the runner-up */}
          {(!hasRunner || isRunner) && (
            <button
              onClick={() => updateProgress.mutate({
                teamId: team.id,
                progress: TeamProgress.RUNNER
              })}
              disabled={isRunner || updateProgress.isLoading}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
                isRunner
                  ? "bg-indigo-900/30 text-indigo-300 border border-indigo-700 cursor-not-allowed opacity-60"
                  : "bg-indigo-900/30 text-indigo-400 border border-indigo-500 hover:bg-indigo-800/40 hover:border-indigo-400"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
              </svg>
              {isRunner ? "Runner-Up" : "Runner-Up"}
            </button>
          )}
          
          {/* Only show second runner-up button if there's no second runner-up yet or this team is already the second runner-up */}
          {(!hasSecondRunner || isSecondRunner) && (
            <button
              onClick={() => updateProgress.mutate({
                teamId: team.id,
                progress: TeamProgress.SECOND_RUNNER
              })}
              disabled={isSecondRunner || updateProgress.isLoading}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
                isSecondRunner
                  ? "bg-purple-900/30 text-purple-300 border border-purple-700 cursor-not-allowed opacity-60"
                  : "bg-purple-900/30 text-purple-400 border border-purple-500 hover:bg-purple-800/40 hover:border-purple-400"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
              </svg>
              {isSecondRunner ? "2nd Runner-Up" : "2nd Runner-Up"}
            </button>
          )}
          
          {/* Only show track winner button if this track doesn't have a winner yet or this team is already the track winner */}
          {(!hasTrackWinner || isTrack) && (
            <button
              onClick={() => updateProgress.mutate({
                teamId: team.id,
                progress: TeamProgress.TRACK
              })}
              disabled={isTrack || updateProgress.isLoading}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
                isTrack
                  ? "bg-emerald-900/30 text-emerald-300 border border-emerald-700 cursor-not-allowed opacity-60"
                  : "bg-emerald-900/30 text-emerald-400 border border-emerald-500 hover:bg-emerald-800/40 hover:border-emerald-400"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              {isTrack ? "Track Winner" : "Track Winner"}
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // For other teams in SELECTED/TOP15 with basic options
  if ((isSelected || isTop15) && !showExtendedOptions) {
    return (
      <div className="flex items-center gap-2">
        {!isTop15 && (
          <button
            onClick={() => updateProgress.mutate({
              teamId: team.id,
              progress: TeamProgress.TOP15
            })}
            disabled={updateProgress.isLoading}
            className="px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-all duration-200 bg-blue-900/30 text-blue-400 border border-blue-500 hover:bg-blue-800/40 hover:border-blue-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Promote to TOP 15
          </button>
        )}
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
  
  // Add sort state
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");

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
      // Check if there are already teams with winner statuses
      const winnerTeam = (data.teams as TeamType[]).find(t => t.teamProgress === "WINNER");
      const runnerTeam = (data.teams as TeamType[]).find(t => t.teamProgress === "RUNNER");
      const secondRunnerTeam = (data.teams as TeamType[]).find(t => t.teamProgress === "SECOND_RUNNER");
      
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
    let overallRawTotal = 0;
    let overallMaxPossibleRaw = 0;
    
    // Calculate overall raw total and max possible
    Object.entries(judgeScores).forEach(([, data]) => {
      overallRawTotal += data.total;
      overallMaxPossibleRaw += data.maxScore * Object.keys(data.scores).length;
    });

    const overallRawPercentage =
      overallMaxPossibleRaw > 0
        ? Math.round((overallRawTotal / overallMaxPossibleRaw) * 100)
        : 0;

    return {
      judgeScores: judgeScores,
      overallRawTotal,
      overallRawPercentage
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
      trackBreakdown: {} as Record<string, number>,
      peopleSelected: 0,
      peopleTop15: 0,
      peopleWinner: 0,
      peopleRunner: 0,
      peopleSecondRunner: 0,
      peopleTrack: 0,
      peopleTrackBreakdown: {} as Record<string, number>
    };
    
    const stats = {
      selected: 0,
      top15: 0,
      winner: 0,
      runner: 0,
      secondRunner: 0,
      track: 0,
      trackBreakdown: {} as Record<string, number>,
      peopleSelected: 0,
      peopleTop15: 0,
      peopleWinner: 0,
      peopleRunner: 0,
      peopleSecondRunner: 0,
      peopleTrack: 0,
      peopleTrackBreakdown: {} as Record<string, number>
    };
    
    (data.teams as TeamType[]).forEach(team => {
      const memberCount = team.Members.length;
      
      if (team.teamProgress === "SELECTED") {
        stats.selected++;
        stats.peopleSelected += memberCount;
      }
      else if (team.teamProgress === "TOP15") {
        stats.top15++;
        stats.peopleTop15 += memberCount;
      }
      else if (team.teamProgress === "WINNER") {
        stats.winner++;
        stats.peopleWinner += memberCount;
      }
      else if (team.teamProgress === "RUNNER") {
        stats.runner++;
        stats.peopleRunner += memberCount;
      }
      else if (team.teamProgress === "SECOND_RUNNER") {
        stats.secondRunner++;
        stats.peopleSecondRunner += memberCount;
      }
      else if (team.teamProgress === "TRACK") {
        stats.track++;
        stats.peopleTrack += memberCount;
        
        // Count by track
        const trackName = team.IdeaSubmission?.track ?? "UNKNOWN";
        if (!stats.trackBreakdown[trackName]) {
          stats.trackBreakdown[trackName] = 0;
          stats.peopleTrackBreakdown[trackName] = 0;
        }
        stats.trackBreakdown[trackName]++;
        // Fix TypeScript error by using the nullish coalescing operator
        stats.peopleTrackBreakdown[trackName] = (stats.peopleTrackBreakdown[trackName] ?? 0) + memberCount;
      }
    });
    
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

  // Filter and sort teams based on search query, selected track, progress filter, and sort order
  const filterTeams = (teams: TeamType[]): TeamType[] => {
    if (!teams) return [];

    // Filter teams
    const filtered = teams.filter((team) => {
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

    // Apply sorting if enabled
    if (sortOrder !== "none") {
      filtered.sort((a, b) => {
        // Calculate scores
        const aScores = a.Scores || [];
        const bScores = b.Scores || [];
        
        const aTotal = aScores.reduce((sum, score) => sum + score.score, 0);
        const bTotal = bScores.reduce((sum, score) => sum + score.score, 0);
        
        // Sort based on order
        return sortOrder === "asc" ? aTotal - bTotal : bTotal - aTotal;
      });
    }

    return filtered;
  };

  // Function to toggle sorting
  const toggleSortOrder = () => {
    if (sortOrder === "none") setSortOrder("desc");
    else if (sortOrder === "desc") setSortOrder("asc");
    else setSortOrder("none");
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
      <h2 className="text-4xl text-center font-semibold mb-6">Jury Scoring Dashboard</h2>

      {/* Team Statistics Summary */}
      <div className="mb-6 border border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-3 text-gray-200">Team Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-sm text-gray-400">SELECTED</div>
            <div className="text-2xl font-bold text-white">{teamStats.selected}</div>
            <div className="text-xs text-gray-400">
              {teamStats.peopleSelected} {teamStats.peopleSelected === 1 ? 'person' : 'people'}
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-sm text-gray-400">TOP 15</div>
            <div className="text-2xl font-bold text-white">{teamStats.top15}</div>
            <div className="text-xs text-gray-400">
              {teamStats.peopleTop15} {teamStats.peopleTop15 === 1 ? 'person' : 'people'}
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-sm text-gray-400">WINNER</div>
            <div className="text-2xl font-bold text-white">{teamStats.winner}</div>
            <div className="text-xs text-gray-400">
              {teamStats.peopleWinner} {teamStats.peopleWinner === 1 ? 'person' : 'people'}
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-sm text-gray-400">RUNNER-UP</div>
            <div className="text-2xl font-bold text-white">{teamStats.runner}</div>
            <div className="text-xs text-gray-400">
              {teamStats.peopleRunner} {teamStats.peopleRunner === 1 ? 'person' : 'people'}
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-sm text-gray-400">2ND RUNNER-UP</div>
            <div className="text-2xl font-bold text-white">{teamStats.secondRunner}</div>
            <div className="text-xs text-gray-400">
              {teamStats.peopleSecondRunner} {teamStats.peopleSecondRunner === 1 ? 'person' : 'people'}
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-sm text-gray-400">TRACK WINNERS</div>
            <div className="text-2xl font-bold text-white">{teamStats.track}</div>
            <div className="text-xs text-gray-400">
              {teamStats.peopleTrack} {teamStats.peopleTrack === 1 ? 'person' : 'people'}
            </div>
          </div>
        </div>
        
        {/* Track Winner Breakdown */}
        {Object.keys(teamStats.trackBreakdown).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2 text-gray-300">Track Winner Breakdown:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(teamStats.trackBreakdown).map(([track, count]) => (
                <div key={track} className="bg-gray-800 border border-gray-700 rounded-full px-3 py-1 text-xs text-gray-300">
                  <span>{track.replace(/_/g, ' ')}:</span> {count} team
                  {count !== 1 ? 's' : ''} ({teamStats.peopleTrackBreakdown[track] ?? 0} {teamStats.peopleTrackBreakdown[track] === 1 ? 'person' : 'people'})
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

        {/* Sort Button */}
        <div>
          <button
            onClick={toggleSortOrder}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 
              ${sortOrder === "none" 
                ? "bg-gray-800 border border-gray-600 text-gray-300" 
                : sortOrder === "asc"
                  ? "bg-blue-900/30 border border-blue-500 text-blue-400" 
                  : "bg-purple-900/30 border border-purple-500 text-purple-400"}`}
            title={sortOrder === "none" ? "Click to sort by score" : sortOrder === "asc" ? "Ascending order" : "Descending order"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              {sortOrder === "none" && (
                <path fillRule="evenodd" d="M10 3a1 1 0 000 2h2a1 1 0 100-2H9zM6.293 10.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414zM6.293 10.293a1 1 0 011.414 0L10 12.586l2.293-2.293a1 1 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              )}
              {sortOrder === "asc" && (
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l-6-6a1 1 0 011.414-1.414l6 6a1 1 0 011.414 0l6-6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              )}
              {sortOrder === "desc" && (
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              )}
            </svg>
            {sortOrder === "none" ? "Sort by Score" : sortOrder === "asc" ? "Score (Low to High)" : "Score (High to Low)"}
          </button>
        </div>
      </div>

      {/* Search results count */}
      <div className="mb-4 text-sm text-gray-400">
        Showing {filteredTeams.length} of {teams.length} teams
        {sortOrder !== "none" && (
          <span className="ml-2">
            (Sorted by score: {sortOrder === "asc" ? "ascending" : "descending"})
          </span>
        )}
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
              overallRawTotal,
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
                          label="Total Score"
                          score={overallRawTotal}
                          className="border border-gray-600"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {/* Show progress actions conditionally based on filter */}
                      {(
                        // Only show actions for specific filters, not for "BOTH" (All Teams) or "SELECTED"
                        (progressFilter === "TOP15" || 
                         (["WINNER", "RUNNER", "SECOND_RUNNER", "TRACK"].includes(progressFilter) && 
                          team.teamProgress === progressFilter))
                        && (
                          <TeamProgressActions
                            team={team}
                            onProgressChange={handleProgressChange}
                            showExtendedOptions={showExtendedOptions}
                            hasWinner={hasWinner}
                            hasRunner={hasRunner}
                            hasSecondRunner={hasSecondRunner}
                            trackWinners={trackWinners}
                          />
                        )
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
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3 005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
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
                                <div>
                                  <div className="font-medium">
                                    {data.judgeName}
                                  </div>
                                  <JudgeScoreRange 
                                    minScore={data.minScore} 
                                    maxScore={data.maxScore} 
                                  />
                                </div>
                                <div className="flex items-center space-x-3">
                                  <ScoreCard
                                    label="Score"
                                    score={data.total}
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

