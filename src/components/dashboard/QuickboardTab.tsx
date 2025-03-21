import { api } from "~/utils/api";

export default function QuickboardTab() {
  const users = api.user.getAllUsers.useQuery();
  const res = api.team.getTeamsList.useQuery();
  const statistics = api.team.getStatistics.useQuery();

  if (users.isLoading || res.isLoading || statistics.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-2xl text-gray-200">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="w-full">
        <h1 className="py-10 text-center text-4xl font-bold">Quick Statistics</h1>
      </div>
      <div className="w-full py-12">
        <div className="mx-auto max-w-7xl px-4">
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
          </div>
        </div>
      </div>
    </div>
  );
}
