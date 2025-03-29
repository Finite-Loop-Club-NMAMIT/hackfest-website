import { api } from "~/utils/api";
import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import type { TeamProgress, PaymentStatus, Tracks, JudgeType } from "@prisma/client";

// Define interfaces for the team data structure that match API response
interface TeamMember {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  isLeader: boolean;
  College: { name: string; } | null;
}

interface TeamRemark {
  id: string;
  remark: string;
  judgeId: string;
  teamId: string;
}

interface Criteria {
  id: string;
  criteria: string;
  maxScore: number;
  JudgeType: JudgeType;
}

interface Score {
  id: number;
  score: number;
  criteriaId: string;
  judgeId: string;
  teamId: string;
  Criteria: Criteria;
}

interface IdeaSubmission {
  id: string;
  teamId: string;
  track: Tracks;
  pptUrl: string;
}

// Updated Team interface to match the API response structure
interface TeamData {
  id: string;
  name: string;
  teamProgress: TeamProgress;
  paymentStatus: PaymentStatus;
  isComplete: boolean;
  Members: TeamMember[];
  IdeaSubmission: IdeaSubmission | null;
  Remark: TeamRemark[];
  Scores: Score[];
}

export default function QuickboardTab() {
  const users = api.user.getAllUsers.useQuery();
  const res = api.team.getTeamsList.useQuery();
  const statistics = api.team.getStatistics.useQuery();
  const collegeAnalytics = api.organiser.getCollegeAnalytics.useQuery();
  const [expandedState, setExpandedState] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<{ id: string; name: string } | null>(null);

  // Fetch college teams when a college is selected
  const collegeTeamsQuery = api.organiser.getCollegeTeams.useQuery(
    { collegeId: selectedCollege?.id ?? "" },
    { enabled: !!selectedCollege?.id }
  );

  if (users.isLoading || res.isLoading || statistics.isLoading || collegeAnalytics.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-2xl text-gray-200">Loading statistics...</div>
      </div>
    );
  }

  // Toggle expanded state
  const toggleState = (state: string) => {
    if (expandedState === state) {
      setExpandedState(null);
    } else {
      setExpandedState(state);
    }
  };

  // Open modal with selected college
  const openTeamsModal = (college: { id: string; name: string }) => {
    setSelectedCollege(college);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCollege(null);
  };

  return (
    <div className="overflow-x-hidden">
      <div className="w-full">
        <h1 className="py-10 text-center text-4xl font-bold">Quick Statistics</h1>
      </div>
      <div className="w-full py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          {/* Statistics cards */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 animate-fade-in">
            <div className="group rounded-2xl bg-white/10 p-8 backdrop-blur-lg transition-all duration-300 hover:bg-white/15 hover:transform hover:scale-105">
              <div className="flex flex-col items-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-200">Number of Logins</h3>
                <span className="text-4xl font-bold text-purple-400 animate-pulse">
                  {users.data?.length ?? 0}
                </span>
              </div>
            </div>

            <div className="group rounded-2xl bg-white/10 p-8 backdrop-blur-lg transition-all duration-300 hover:bg-white/15 hover:transform hover:scale-105">
              <div className="flex flex-col items-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-200">Number of Teams</h3>
                <span className="text-4xl font-bold text-purple-400 animate-pulse">
                  {res.data?.length ?? 0}
                </span>
              </div>
            </div>

            <div className="group rounded-2xl bg-white/10 p-8 backdrop-blur-lg transition-all duration-300 hover:bg-white/15 hover:transform hover:scale-105">
              <div className="flex flex-col items-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-200">Idea Submissions</h3>
                <span className="text-4xl font-bold text-purple-400 animate-pulse">
                  {res.data?.filter((team) => team.IdeaSubmission).length ?? 0}
                </span>
              </div>
            </div>

            <div className="group rounded-2xl bg-white/10 p-8 backdrop-blur-lg transition-all duration-300 hover:bg-white/15 hover:transform hover:scale-105">
              <div className="flex flex-col items-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-200">Teams Confirmed</h3>
                <span className="text-4xl font-bold text-purple-400 animate-pulse">
                  {statistics.data?.teamsConfirmed ?? 0}
                </span>
              </div>
            </div>

            <div className="group rounded-2xl bg-white/10 p-8 backdrop-blur-lg transition-all duration-300 hover:bg-white/15 hover:transform hover:scale-105">
              <div className="flex flex-col items-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-200">Unique Stats</h3>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">States:</span>
                    <span className="text-xl font-bold text-purple-400 animate-pulse">
                      {statistics.data?.uniqueStatesCount ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Colleges:</span>
                    <span className="text-xl font-bold text-purple-400 animate-pulse">
                      {statistics.data?.uniqueCollegesCount ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl bg-white/10 p-8 backdrop-blur-lg transition-all duration-300 hover:bg-white/15 hover:transform hover:scale-105">
              <div className="flex flex-col items-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-200">Participants</h3>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Internal:</span>
                    <span className="text-xl font-bold text-purple-400 animate-pulse">
                      {statistics.data?.internalCount ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">External:</span>
                    <span className="text-xl font-bold text-purple-400 animate-pulse">
                      {statistics.data?.externalCount ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl bg-white/10 p-8 backdrop-blur-lg transition-all duration-300 hover:bg-white/15 hover:transform hover:scale-105">
              <div className="flex flex-col items-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-200">College Insights</h3>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Total Colleges:</span>
                    <span className="text-xl font-bold text-purple-400 animate-pulse">
                      {collegeAnalytics.data?.totalColleges ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">With Confirmed Teams:</span>
                    <span className="text-xl font-bold text-purple-400 animate-pulse">
                      {collegeAnalytics.data?.collegesWithConfirmedTeams ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">With Selected Teams:</span>
                    <span className="text-xl font-bold text-purple-400 animate-pulse">
                      {collegeAnalytics.data?.collegesWithSelectedTeams ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top colleges section */}
          {collegeAnalytics.data?.collegeBreakdown?.some((c) => c.selectedTeams > 0) && (
            <div className="mt-12">
              <h2 className="mb-6 text-2xl font-semibold text-gray-200">Top Colleges by Selected Teams</h2>
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur-lg">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="px-4 py-2 text-left text-gray-300">College</th>
                        <th className="px-4 py-2 text-center text-gray-300">Selected Teams</th>
                        <th className="px-4 py-2 text-center text-gray-300">Confirmed Teams</th>
                        <th className="px-4 py-2 text-center text-gray-300">Total Teams</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collegeAnalytics.data.collegeBreakdown
                        .filter((college) => college.selectedTeams > 0)
                        .slice(0, 5)
                        .map((college) => (
                          <tr key={college.id} className="border-b border-gray-700">
                            <td className="px-4 py-2 text-gray-200">{college.name}</td>
                            <td
                              className="px-4 py-2 text-center"
                              onClick={() => openTeamsModal({ id: college.id, name: college.name })}
                            >
                              <span className="inline-block px-3 py-1 rounded border border-purple-500/60 bg-purple-500/20 text-purple-400 font-medium hover:bg-purple-500/30 transition-colors cursor-pointer shadow-sm shadow-purple-500/20 hover:shadow-purple-500/40">
                                {college.selectedTeams}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center text-blue-400">{college.confirmedTeams}</td>
                            <td className="px-4 py-2 text-center text-gray-300">{college.totalTeams}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* College analytics by state section */}
          {collegeAnalytics.data?.stateAnalytics && collegeAnalytics.data.stateAnalytics.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-6 text-2xl font-semibold text-gray-200">College Analytics by State</h2>
              <div className="space-y-4">
                {collegeAnalytics.data?.stateAnalytics
                  .filter((stateData) => stateData.totalColleges > 0)
                  .map((stateData) => (
                    <div key={stateData.state} className="rounded-lg bg-white/10 backdrop-blur-lg overflow-hidden">
                      <div
                        className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => toggleState(stateData.state)}
                      >
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-200">
                            {stateData.state.replace(/_/g, " ")}
                          </h3>
                          <div className="grid grid-cols-3 mt-2 text-sm">
                            <div>
                              <span className="text-gray-400">Colleges: </span>
                              <span className="text-purple-400 font-medium">{stateData.totalColleges}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Selected Teams: </span>
                              <span className="text-purple-400 font-medium">{stateData.selectedTeams}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Confirmed Teams: </span>
                              <span className="text-blue-400 font-medium">{stateData.confirmedTeams}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              expandedState === stateData.state ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {expandedState === stateData.state && stateData.colleges.length > 0 && (
                        <div className="border-t border-gray-800 overflow-x-auto">
                          <table className="w-full table-auto">
                            <thead>
                              <tr className="bg-black/20 border-b border-gray-800">
                                <th className="px-4 py-2 text-left text-gray-400">College</th>
                                <th className="px-4 py-2 text-center text-gray-400">Selected Teams</th>
                                <th className="px-4 py-2 text-center text-gray-400">Confirmed Teams</th>
                                <th className="px-4 py-2 text-center text-gray-400">Total Teams</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stateData.colleges
                                .sort((a, b) => b.selectedTeams - a.selectedTeams)
                                .map((college) => (
                                  <tr key={college.id} className="border-b border-gray-800 hover:bg-white/5">
                                    <td className="px-4 py-2 text-gray-300">{college.name}</td>
                                    <td
                                      className="px-4 py-2 text-center"
                                    >
                                      {college.selectedTeams > 0 ? (
                                        <span 
                                          onClick={() => openTeamsModal({ id: college.id, name: college.name })}
                                          className="inline-block px-3 py-1 rounded border border-purple-500/60 bg-purple-500/20 text-purple-400 font-medium hover:bg-purple-500/30 transition-colors cursor-pointer shadow-sm shadow-purple-500/20 hover:shadow-purple-500/40"
                                        >
                                          {college.selectedTeams}
                                        </span>
                                      ) : (
                                        <span className="text-gray-500">{college.selectedTeams}</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-2 text-center text-blue-400">{college.confirmedTeams}</td>
                                    <td className="px-4 py-2 text-center text-gray-400">{college.totalTeams}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Teams Modal */}
          <Transition appear show={isModalOpen} as={Fragment}>
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
                <div className="fixed inset-0 bg-black/75" />
              </Transition.Child>

              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-xl bg-gray-900 border border-gray-700 p-6 shadow-xl transition-all">
                      <Dialog.Title className="text-2xl font-semibold text-gray-100 mb-2">
                        Selected Teams: {selectedCollege?.name}
                      </Dialog.Title>

                      {collegeTeamsQuery.isLoading && (
                        <div className="flex justify-center my-8">
                          <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
                        </div>
                      )}

                      {collegeTeamsQuery.isError && (
                        <div className="text-red-400 my-4">Failed to load team data. Please try again.</div>
                      )}

                      {!collegeTeamsQuery.isLoading && !collegeTeamsQuery.isError && (
                        <>
                          {collegeTeamsQuery.data?.teams && collegeTeamsQuery.data.teams.length > 0 ? (
                            <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2 space-y-6">
                              {collegeTeamsQuery.data.teams.map((team: TeamData) => (
                                <div key={team.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                  <h3 className="text-xl font-medium text-purple-400">{team.name}</h3>

                                  <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                      <p className="text-gray-400 text-sm">Team ID</p>
                                      <p className="text-gray-200">{team.id}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-400 text-sm">Progress</p>
                                      <p className="text-green-400">{team.teamProgress}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-400 text-sm">Payment Status</p>
                                      <p
                                        className={
                                          team.paymentStatus === "PAID" ? "text-green-400" : "text-yellow-400"
                                        }
                                      >
                                        {team.paymentStatus}
                                      </p>
                                    </div>
                                    {team.IdeaSubmission && (
                                      <div>
                                        <p className="text-gray-400 text-sm">Track</p>
                                        <p className="text-blue-400">{team.IdeaSubmission.track}</p>
                                      </div>
                                    )}
                                  </div>

                                  {team.Remark && team.Remark.length > 0 && (
                                    <div className="mt-3">
                                      <p className="text-gray-400 text-sm">Remarks</p>
                                      <div className="bg-gray-900/50 rounded p-2 mt-1">
                                        {team.Remark.map((remark: TeamRemark, idx: number) => (
                                          <p key={idx} className="text-gray-300 text-sm">
                                            {remark.remark}
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div className="mt-4">
                                    <p className="text-gray-400 text-sm mb-2">Team Members</p>
                                    <div className="bg-gray-900/50 rounded-lg overflow-hidden">
                                      <table className="w-full text-sm">
                                        <thead>
                                          <tr className="bg-gray-800/50 border-b border-gray-700">
                                            <th className="px-3 py-2 text-left text-gray-300">Name</th>
                                            <th className="px-3 py-2 text-left text-gray-300">Email</th>
                                            <th className="px-3 py-2 text-left text-gray-300">Role</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {team.Members.map((member: TeamMember) => (
                                            <tr key={member.id} className="border-b border-gray-700/50">
                                              <td className="px-3 py-2 text-gray-200">{member.name}</td>
                                              <td className="px-3 py-2 text-gray-300">{member.email}</td>
                                              <td className="px-3 py-2">
                                                <span
                                                  className={`px-2 py-1 rounded-full text-xs ${
                                                    member.isLeader
                                                      ? "bg-purple-500/20 text-purple-300"
                                                      : "bg-blue-500/20 text-blue-300"
                                                  }`}
                                                >
                                                  {member.isLeader ? "Leader" : "Member"}
                                                </span>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-300 my-8 text-center">
                              No selected teams found for this college.
                            </div>
                          )}
                        </>
                      )}

                      <div className="mt-6 flex justify-end">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
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
        </div>
      </div>
    </div>
  );
}
