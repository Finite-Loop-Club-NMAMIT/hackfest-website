import React, { useState } from "react";
import { api } from "~/utils/api";
import Spinner from "~/components/spinner";
import { toast } from "react-hot-toast";
import type { Arena, Dormitory, TeamProgress } from "@prisma/client";

// Define type for team members
interface TeamMember {
  id: string;
  name?: string | null;
  email?: string | null;
  gender?: string | null;
}

// Define team type for allocation
interface TeamForAllocation {
  id: string;
  name: string;
  teamNo: number;
  teamProgress: TeamProgress;
  boysDormitory: Dormitory;
  girlsDormitory: Dormitory ;
  arena: Arena ;
  Members: TeamMember[];
}

const AllocationTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string>("ALL");
  
  // Fetch all teams that need allocation
  const { data: teams, isLoading, refetch } = api.organiser.getAllTeamsForAllocation.useQuery();
  
  // Fetch allocation summary for the status dashboard
  const { data: summary, isLoading: isLoadingSummary } = api.organiser.getAllocationSummary.useQuery();
  
  // Mutation for updating team allocations
  const updateAllocationMutation = api.organiser.updateTeamAllocation.useMutation({
    onSuccess: () => {
      toast.success("Allocation updated successfully");
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update allocation");
    }
  });
  
  // Handle allocation changes
  const handleAllocationChange = async (
    teamId: string, 
    field: 'boysDormitory' | 'girlsDormitory' | 'arena',
    value: Dormitory | Arena
  ) => {
    try {
      await updateAllocationMutation.mutateAsync({
        teamId,
        [field]: value
      });
    } catch (error) {
      console.error("Error updating allocation:", error instanceof Error ? error.message : "Unknown error");
    }
  };
  
  // Filter teams based on search term and filter
  const filteredTeams = teams?.map((team) => team as unknown as TeamForAllocation).filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          team.Members.some(m => m.name?.toLowerCase()?.includes(searchTerm.toLowerCase()));
    
    if (filter === "ALL") return matchesSearch;
    if (filter === "UNALLOCATED_ARENA") return matchesSearch && (!team.arena || team.arena === "NOT_ASSIGNED");
    if (filter === "UNALLOCATED_DORM") {
      return matchesSearch && (
        !team.boysDormitory || 
        team.boysDormitory === "NOT_ASSIGNED" || 
        !team.girlsDormitory || 
        team.girlsDormitory === "NOT_ASSIGNED"
      );
    }
    return matchesSearch && team.teamProgress === filter as TeamProgress;
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Allocation Status Dashboard */}
      <div className="rounded-lg bg-gray-800/30 p-6">
        <h2 className="mb-4 text-xl font-bold">Allocation Status</h2>
        
        {isLoadingSummary ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Arena Allocation Stats */}
            <div className="rounded-lg bg-gray-800/20 p-4">
              <h3 className="mb-3 text-lg font-semibold">Arena Allocations</h3>
              <div className="space-y-2">
                {summary && Object.entries(summary.arenaCounts).map(([arena, count]) => (
                  <div key={arena} className="flex items-center justify-between">
                    <span className="font-medium">{arena.replace('_', ' ')}</span>
                    <span className="rounded bg-purple-500/20 px-2 py-1 text-sm">{count} teams</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Dormitory Allocation Stats */}
            <div className="rounded-lg bg-gray-800/20 p-4">
              <h3 className="mb-3 text-lg font-semibold">Dormitory Allocations</h3>
              <div className="space-y-2">
                {summary && Object.entries(summary.dormitoryCounts).map(([dorm, count]) => (
                  <div key={dorm} className="flex items-center justify-between">
                    <span className="font-medium">{dorm.replace('_', ' ')}</span>
                    <span className="rounded bg-purple-500/20 px-2 py-1 text-sm">{count} allocations</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Search and Filter Controls */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
        <div className="w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search teams or members..."
            className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white focus:border-purple-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-1/2">
          <select
            className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white focus:border-purple-500 focus:outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Teams</option>
            <option value="UNALLOCATED_ARENA">Unallocated Arena</option>
            <option value="UNALLOCATED_DORM">Unallocated Dormitories</option>
            <option value="SELECTED">Selected Teams</option>
            <option value="TOP15">Top 15 Teams</option>
            <option value="WINNER">Winner</option>
            <option value="RUNNER">Runner</option>
            <option value="SECOND_RUNNER">Second Runner</option>
            <option value="TRACK">Track Winner</option>
          </select>
        </div>
      </div>
      
      {/* Teams Allocation Table */}
      <div className="overflow-x-auto rounded-lg bg-gray-800/30">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Boys Dormitory
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Girls Dormitory
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Arena
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Members
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 bg-gray-800/10">
            {filteredTeams?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                  No teams match your search criteria.
                </td>
              </tr>
            ) : (
              filteredTeams?.map(team => (
                <tr key={team.id} className="transition-colors hover:bg-gray-700/30">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-medium text-white">{team.name}</div>
                    <div className="text-xs text-gray-400">Team #{team.teamNo}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="rounded bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-300">
                      {team.teamProgress}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <select
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white focus:border-purple-500 focus:outline-none"
                      value={team.boysDormitory ?? "NOT_ASSIGNED"}
                      onChange={(e) => {
                        const value = e.target.value as Dormitory;
                        void handleAllocationChange(team.id, 'boysDormitory', value);
                      }}
                      disabled={updateAllocationMutation.isLoading}
                    >
                      <option value="NOT_ASSIGNED">Not Assigned</option>
                      <option value="NC61">NC61</option>
                      <option value="NC62">NC62</option>
                      <option value="NC63">NC63</option>
                      <option value="SMV51">SMV51</option>
                      <option value="SMV52">SMV52</option>
                      <option value="SMV53">SMV53</option>
                      <option value="SMV22">SMV22</option>
                      <option value="SMV24">SMV24</option>
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <select
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white focus:border-purple-500 focus:outline-none"
                      value={team.girlsDormitory ?? "NOT_ASSIGNED"}
                      onChange={(e) => {
                        const value = e.target.value as Dormitory;
                        void handleAllocationChange(team.id, 'girlsDormitory', value);
                      }}
                      disabled={updateAllocationMutation.isLoading}
                    >
                      <option value="NOT_ASSIGNED">Not Assigned</option>
                      <option value="NC61">NC61</option>
                      <option value="NC62">NC62</option>
                      <option value="NC63">NC63</option>
                      <option value="SMV51">SMV51</option>
                      <option value="SMV52">SMV52</option>
                      <option value="SMV53">SMV53</option>
                      <option value="SMV22">SMV22</option>
                      <option value="SMV23">SMV23</option>
                      <option value="SMV24">SMV24</option>
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <select
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white focus:border-purple-500 focus:outline-none"
                      value={team.arena ?? "NOT_ASSIGNED"}
                      onChange={(e) => {
                        const value = e.target.value as Arena;
                        void handleAllocationChange(team.id, 'arena', value);
                      }}
                      disabled={updateAllocationMutation.isLoading}
                    >
                      <option value="NOT_ASSIGNED">Not Assigned</option>
                      <option value="ADL03">ADL03</option>
                      <option value="ADL04">ADL04</option>
                      <option value="SMVL51">SMVL51</option>
                      <option value="SMVL52">SMVL52</option>
                      <option value="SMVL54">SMVL54</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-h-20 overflow-y-auto text-sm">
                      {team.Members.map(member => (
                        <div key={member.id} className="mb-1">
                          {member.name ?? "Unnamed"} 
                          {member.gender && (
                            <span className={`ml-1 text-xs ${
                              member.gender === 'MALE' ? 'text-blue-400' : 'text-pink-400'
                            }`}>
                              ({member.gender})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Bulk Actions (Optional) */}
      <div className="rounded-lg bg-gray-800/30 p-6">
        <h3 className="mb-4 text-lg font-semibold">Allocation Help</h3>
        <p className="text-gray-400">
          Allocate dormitories and arenas to teams using the dropdown menus above. Each team can be assigned one arena and separate dormitories for boys and girls.
        </p>
        <p className="mt-2 text-gray-400">
          <strong>Note:</strong> Arenas must be uniquely assigned. The system will prevent duplicate arena assignments.
        </p>
      </div>
    </div>
  );
};

export default AllocationTab;