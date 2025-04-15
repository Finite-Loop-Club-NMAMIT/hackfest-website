import { useState } from "react";
import { api } from "~/utils/api";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import type {  JudgeType } from "@prisma/client";

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

const ScoreCard = ({ label, score, maxScore, className = "" }: { label: string; score: number | string; maxScore?: number; className?: string }) => {
  return (
    <div className={`p-2 rounded-lg text-center border border-gray-600 ${className}`}>
      <div className="text-xs text-gray-300 truncate max-w-[80px]">{label}</div>
      <div className="text-lg font-semibold">
        {score}
        {maxScore ? <span className="text-xs text-gray-400">/{maxScore}</span> : null}
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
  variant = "primary" 
}: { 
  onClick: () => void; 
  children: React.ReactNode; 
  variant?: "primary" | "secondary" | "outline"; 
}) => {
  const baseStyle = "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none";
  
  const variantStyles = {
    primary: "border border-blue-500 hover:border-blue-400 text-blue-400 hover:text-blue-300",
    secondary: "border border-purple-500 hover:border-purple-400 text-purple-400 hover:text-purple-300",
    outline: "border border-gray-600 hover:border-white text-gray-300 hover:text-white"
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
  teamName
}: { 
  isOpen: boolean; 
  closeModal: () => void; 
  remarks: TeamRemark[];
  teamName: string;
}) => {
  const remarksByType: Record<string, TeamRemark[]> = {};
  
  remarks.forEach(remark => {
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
                    <div className="py-4 text-center text-gray-400">No remarks available for this team</div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(remarksByType).length > 0 ? (
                        Object.entries(remarksByType).map(([judgeType, typeRemarks]) => (
                          <div key={judgeType}>                            
                            <div className="space-y-4">
                              {typeRemarks.map((remarkItem, idx) => (
                                <div key={idx} className="border border-gray-700 p-4 rounded-lg bg-gray-800/80">
                                  <div className="font-medium text-blue-400 mb-1">
                                    {remarkItem.Judge.User[0]?.name ?? "Unknown Judge"}
                                  </div>
                                  <p className="text-gray-300 whitespace-pre-wrap">{remarkItem.remark}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="space-y-4">
                          {remarks.map((remarkItem, idx) => (
                            <div key={idx} className="border border-gray-700 p-4 rounded-lg bg-gray-800/80">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium text-blue-400">
                                  {remarkItem.Judge.User[0]?.name ?? "Unknown Judge"}
                                </div>
                                {remarkItem.Judge.type && (
                                  <JudgeTypeLabel type={remarkItem.Judge.type} />
                                )}
                              </div>
                              <p className="text-gray-300 whitespace-pre-wrap">{remarkItem.remark}</p>
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
  children 
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
        <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </button>
      
      <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
};

export default function ScoreTab() {
  const [selectedTeamRemarks, setSelectedTeamRemarks] = useState<{
    teamName: string;
    remarks: TeamRemark[];
  } | null>(null);

  const { data, isLoading, error } = api.organiser.getTeamScores.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const showRemarks = (teamName: string, remarks: TeamRemark[]) => {
    if (remarks) {
      setSelectedTeamRemarks({ teamName, remarks });
    }
  };

  const closeRemarksModal = () => {
    setSelectedTeamRemarks(null);
  };

  const organizeScoresByJudge = (scores: ScoreItem[]) => {
    const judgeScores: Record<string, { 
      judgeName: string,
      judgeType: string, 
      scores: Record<string, number>, 
      total: number,
      minScore: number,
      maxScore: number
    }> = {};
    
    scores.forEach(score => {
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
          maxScore: -Infinity
        };
      }
      
      judgeScores[judgeId].scores[criteriaId] = score.score;
      judgeScores[judgeId].total += score.score;
      
      judgeScores[judgeId].minScore = Math.min(judgeScores[judgeId].minScore, score.score);
      judgeScores[judgeId].maxScore = Math.max(judgeScores[judgeId].maxScore, score.score);
    });
    
    return judgeScores;
  };

  const groupJudgesByType = (judges: Record<string, { 
    judgeName: string,
    judgeType: string, 
    scores: Record<string, number>, 
    total: number,
    minScore: number,
    maxScore: number
  }>) => {
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
    judgeScores: Record<string, { 
      judgeName: string,
      judgeType: string, 
      scores: Record<string, number>, 
      total: number,
      minScore: number,
      maxScore: number
    }>
  ) => {
    const normalizedScores: Record<string, { 
      rawTotal: number, 
      normalizedTotal: number 
    }> = {};
    
    let overallRawTotal = 0;
    let overallMaxPossibleRaw = 0;
    let overallNormalizedTotal = 0;
    let judgeCount = 0;

    Object.entries(judgeScores).forEach(([judgeId, data]) => {
      const scoreRange = data.maxScore - data.minScore;
      let normalizedTotal = 0;
      
      if (scoreRange > 0) {
        normalizedTotal = Math.round(((data.total - (data.minScore * Object.keys(data.scores).length)) / 
          (scoreRange * Object.keys(data.scores).length)) * 100);
      } else if (data.maxScore > 0) {
        normalizedTotal = 100;
      } else {
        normalizedTotal = 0;
      }
      
      normalizedScores[judgeId] = {
        rawTotal: data.total,
        normalizedTotal: normalizedTotal
      };
      
      overallRawTotal += data.total;
      const criteriaCount = Object.keys(data.scores).length;
      overallMaxPossibleRaw += data.maxScore * criteriaCount;
      overallNormalizedTotal += normalizedTotal;
      judgeCount++;
    });
    
    const overallNormalizedPercentage = judgeCount > 0 
      ? Math.round(overallNormalizedTotal / judgeCount)
      : 0;
    
    const overallRawPercentage = overallMaxPossibleRaw > 0
      ? Math.round((overallRawTotal / overallMaxPossibleRaw) * 100)
      : 0;
      
    return { 
      judgeScores: normalizedScores, 
      overallRawTotal,
      overallRawPercentage,
      overallNormalizedTotal,
      overallNormalizedPercentage
    };
  };

  const calculatePercentileRank = (teamScore: number, allScores: number[]): number => {
    const sortedScores = [...allScores].sort((a, b) => a - b);
    
    const position = sortedScores.findIndex(score => score >= teamScore);
    
    const percentile = (position / sortedScores.length) * 100;
    
    return Math.round(percentile);
  };

  const calculateNormalizedPercentile = (percentile: number): number => {
    return 100 - percentile;
  };

  const getPercentileText = (percentile: number): string => {
    const normalizedPercentile = calculateNormalizedPercentile(percentile);
    if (normalizedPercentile >= 90) return "Top 10%";
    if (normalizedPercentile >= 75) return "Top 25%";
    if (normalizedPercentile >= 50) return "Top 50%";
    if (normalizedPercentile >= 25) return "Top 75%";
    return "Bottom 25%";
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

  const allTeamNormalizedScores: number[] = teams.map(team => {
    const judgeScores = organizeScoresByJudge(team.Scores);
    const { overallNormalizedPercentage } = normalizeJudgeScores(judgeScores);
    return overallNormalizedPercentage;
  });

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-semibold mb-2">Jury Scoring Dashboard</h2>
      <p className="text-gray-400 mb-6">Showing scores for Day 2 Round 1 and Round 2 evaluations. All remarks are displayed.</p>

      <div className="border border-gray-700 p-4 mb-6 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Score Interpretation</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="flex items-center">
            <span className="text-sm">P90-100: Top 10%</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm">P75-89: Top 25%</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm">P50-74: Top 50%</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm">P25-49: Top 75%</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm">P0-24: Bottom 25%</span>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-400">
          <p><strong>Raw Score:</strong> Actual points given by judges</p>
          <p><strong>Normalized Score:</strong> Scores adjusted for each judge&apos;s scoring range (0-100)</p>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="border border-gray-700 p-6 rounded-lg text-center text-gray-400">
          <p>No teams with SELECTED or TOP15 status found.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {teams.map((team) => {
            const judgeScores = organizeScoresByJudge(team.Scores);
            const judgesByType = groupJudgesByType(judgeScores);
            const { 
              judgeScores: normalizedJudgeScores, 
              overallRawTotal,
              overallRawPercentage,
              overallNormalizedTotal,
              overallNormalizedPercentage 
            } = normalizeJudgeScores(judgeScores);
            
            const percentile = calculatePercentileRank(overallNormalizedPercentage, allTeamNormalizedScores);
            const normalizedPercentile = calculateNormalizedPercentile(percentile);
            const percentileText = getPercentileText(percentile);
            
            return (
              <div key={team.id} className="border border-gray-700 rounded-lg overflow-hidden shadow-lg">
                <div className="border-b border-gray-700 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center">
                      <div className="text-3xl">{team.name}</div>
                      <span className="ml-3 text-xs px-2 py-1 rounded-full border border-gray-600">
                        P{normalizedPercentile} • {percentileText}
                      </span>
                    </h3>
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                      <span>Team #{team.teamNo} • {team.teamProgress === "TOP15" ? "TOP 15" : "SELECTED"}</span>
                      <span className="text-xs border-l border-gray-600 pl-2">
                        {team.Members.length} Members
                      </span>
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
                    <div className="flex items-center">
                      <ActionButton 
                        onClick={() => showRemarks(team.name, team.Remark)}
                        variant={team.Remark.length > 0 ? "primary" : "outline"}
                      >
                        {team.Remark.length > 0 ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
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

                <div className="p-4">
                  <CollapsibleSection 
                    title="Team Members" 
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                    }
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {team.Members.map(member => (
                        <div key={member.id} className="border border-gray-700 rounded-lg p-3">
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-blue-400 truncate">
                            <a href={`mailto:${member.email}`} className="hover:underline">
                              {member.email}
                            </a>
                          </div>
                          {member.phone && 
                            <div className="text-sm text-gray-400">
                              <a href={`tel:${member.phone}`} className="hover:underline">
                                {member.phone}
                              </a>
                            </div>
                          }
                          {member.College && 
                            <div className="mt-1 text-xs text-gray-500">
                              {member.College.name}
                            </div>
                          }
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>
                  
                  <h4 className="text-md font-medium mb-3 text-gray-300 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    Score Breakdown
                  </h4>

                  <div className="space-y-6">
                    {Object.entries(judgesByType).map(([judgeType, judges]) => (
                      <div key={judgeType} className="border-t border-gray-700 pt-4 first:border-t-0 first:pt-0">
                        <div className="mb-3 flex items-center">
                          <JudgeTypeLabel type={judgeType} />
                        </div>
                        
                        <div className="space-y-4">
                          {Object.entries(judges).map(([judgeId, data]) => (
                            <div key={judgeId} className="border border-gray-700 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <div className="font-medium">
                                  {data.judgeName}
                                </div>
                                <div className="flex items-center space-x-3">
                                  <ScoreCard
                                    label="Raw Score"
                                    score={normalizedJudgeScores[judgeId]?.rawTotal ?? 0}
                                    className="border border-gray-600"
                                  />
                                  <ScoreCard
                                    label="Normalized"
                                    score={`${normalizedJudgeScores[judgeId]?.normalizedTotal ?? 0}`}
                                    className="border border-gray-600"
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-2">
                                {Object.entries(data.scores).map(([criteriaId, score]) => {
                                  const criterion = criteria.find(c => c.id === criteriaId);
                                  return (
                                    <ScoreCard
                                      key={criteriaId}
                                      label={criterion?.criteria ?? "Unknown"}
                                      score={score}
                                      maxScore={criterion?.maxScore}
                                      className="border border-gray-600"
                                    />
                                  );
                                })}
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
