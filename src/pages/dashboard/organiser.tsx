import DashboardLayout from "~/components/layout/dashboardLayout";
import ParticipantsTable from "~/components/participantsTable";
import { api } from "~/utils/api";
import { useEffect, useState } from "react";
import Spinner from "~/components/spinner";
import { useSession } from "next-auth/react";
import NotFound from "../404";
import JudgePanel from "~/components/organiserDashboard/judgePanel";
import VolunteerPanel from "~/components/organiserDashboard/volunteerPanel";
import FilterSheet from "~/components/organiserDashboard/filterSheet";
import GithubSheet from "~/components/organiserDashboard/githubSheet";
import Analytics from "~/components/organiserDashboard/analytics";
export default function Organiser() {
  const res = api.team.getTeamsList.useQuery();
  const users = api.user.getAllUsers.useQuery().data;
  const top15 = api.team.top15.useQuery().data;
  // Add the new statistics query
  const statistics = api.team.getStatistics.useQuery();

  const allTeams = res.data;
  const [selectedTeams, setSelectedTeams] = useState(top15);
  const [activeTab, setActiveTab] = useState("teams");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paymentQuery, setPaymentQuery] = useState("ALL");
  const [top60Query, setTop60Query] = useState("TOP 60");
  const [submissionQuery, setSubmissionQuery] = useState("ALL");
  const [trackQuery, setTrackQuery] = useState("ALL");

  const filterSheetProps = {
    searchQuery: searchQuery,
    paymentQuery: paymentQuery,
    top60Query: top60Query,
    submissionQuery: submissionQuery,
    trackQuery: trackQuery,
    setSearchQuery: setSearchQuery,
    setPaymentQuery: setPaymentQuery,
    setTop60Query: setTop60Query,
    setSubmissionQuery: setSubmissionQuery,
    setTrackQuery: setTrackQuery,
  };

  const { data, status } = useSession();

  // Initialize activeTab from localStorage when the component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTab = localStorage.getItem('organiserActiveTab');
      if (storedTab && ['teams', 'analytics', 'roles'].includes(storedTab)) {
        setActiveTab(storedTab);
      }
    }
  }, []);

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('organiserActiveTab', activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    setSelectedTeams(() => {
      let partiallyFiltered = allTeams;

      const newSearchQuery = searchQuery.trim().toLowerCase();
      if (newSearchQuery !== "") {
        partiallyFiltered = partiallyFiltered?.filter((team) => {
          const teamName = team.name.toLowerCase();
          return (
            teamName.includes(newSearchQuery) ||
            team.id.includes(newSearchQuery)
          );
        });
      }

      if (paymentQuery !== "ALL") {
        partiallyFiltered = partiallyFiltered?.filter(
          (team) => team.paymentStatus === paymentQuery,
        );
      }

      if (top60Query !== "ALL") {
        partiallyFiltered = partiallyFiltered?.filter((team) => {
          const temp =
            top60Query === "NOT SELECTED"
              ? "NOT_SELECTED"
              : top60Query === "TOP 100"
                ? "SEMI_SELECTED"
                : top60Query === "TOP 60"
                  ? "SELECTED"
                  : "";

          return team.teamProgress === temp;
        });
      }

      if (submissionQuery !== "ALL") {
        partiallyFiltered = partiallyFiltered?.filter(
          (team) => !!team.IdeaSubmission === (submissionQuery === "SUBMITTED"),
        );
      }

      if (trackQuery !== "ALL" && submissionQuery !== "NOT SUBMITTED") {
        partiallyFiltered = partiallyFiltered?.filter(
          (team) => team.IdeaSubmission?.track === trackQuery,
        );
      }

      return partiallyFiltered;
    });
  }, [
    res.data,
    searchQuery,
    paymentQuery,
    top60Query,
    submissionQuery,
    trackQuery,
    allTeams,
  ]);
  if (status === "loading")
    return (
      <DashboardLayout>
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner />
        </div>
      </DashboardLayout>
    );

  if (!data || !data.user || data.user.role !== "ADMIN") {
    return <NotFound />;
  }

  return (
    <DashboardLayout>
      <div className="w-full my-14">
        {/* Custom Tabs Navigation */}
        <div className="flex flex-row items-center justify-center border-b">
          <button
            onClick={() => setActiveTab("teams")}
            className={`w-full py-2 px-4 text-center transition-colors ${
              activeTab === "teams" 
                ? "border-b-2 border-purple-500 font-bold" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            Teams
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full py-2 px-4 text-center transition-colors ${
              activeTab === "analytics" 
                ? "border-b-2 border-purple-500 font-bold" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`w-full py-2 px-4 text-center transition-colors ${
              activeTab === "roles" 
                ? "border-b-2 border-purple-500 font-bold" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            Roles
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "teams" && (
          <div>
            <div className="w-full">
              <h1 className="py-10 text-center text-4xl font-bold">Organiser</h1>
            </div>
            <div className="w-full py-12">
              <div className="mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3 animate-fade-in">
                  <div className="group rounded-2xl bg-white/10 p-8 backdrop-blur-lg transition-all duration-300 hover:bg-white/15 hover:transform hover:scale-105">
                    <div className="flex flex-col items-center space-y-2">
                      <h3 className="text-xl font-semibold text-gray-200">Number of Logins</h3>
                      <span className="text-4xl font-bold text-purple-400 animate-pulse">
                        {users?.length ?? 0}
                      </span>
                    </div>
                  </div>

                  <div className="group rounded-2xl bg-white/10 p-8 backdrop-blur-lg transition-all duration-300 hover:bg-white/15 hover:transform hover:scale-105">
                    <div className="flex flex-col items-center space-y-2">
                      <h3 className="text-xl font-semibold text-gray-200">Number of Teams</h3>
                      <span className="text-4xl font-bold text-purple-400 animate-pulse">
                        {res?.data?.length ?? 0}
                      </span>
                    </div>
                  </div>

                  <div className="group rounded-2xl bg-white/10 p-8 backdrop-blur-lg transition-all duration-300 hover:bg-white/15 hover:transform hover:scale-105">
                    <div className="flex flex-col items-center space-y-2">
                      <h3 className="text-xl font-semibold text-gray-200">Idea Submissions</h3>
                      <span className="text-4xl font-bold text-purple-400 animate-pulse">
                        {res?.data?.filter((team) => team.IdeaSubmission).length ?? 0}
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
                </div>
              </div>
            </div>
            <div className="m-auto overflow-x-scroll md:max-w-screen-xl">
              <h1 className="my-8 text-center text-2xl font-bold">
                Participants
              </h1>
              <div className="my-4 flex h-full w-full flex-col items-center justify-around gap-3 md:flex-row">
                <GithubSheet />
                <FilterSheet {...filterSheetProps} />
              </div>
              {!res ? (
                <Spinner size="large" />
              ) : (
                <ParticipantsTable
                  data={selectedTeams}
                  dataRefecth={res.refetch}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div>
            <div className="w-full">
              <h1 className="py-10 text-center text-4xl font-bold">Analytics Dashboard</h1>
            </div>
            <div className="w-full py-12">
              <Analytics />
            </div>
          </div>
        )}

        {activeTab === "roles" && (
          <div>
            <JudgePanel users={users} />
            <VolunteerPanel users={users} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
