import { api } from "~/utils/api";
import Spinner from "../spinner";
import { type JudgeType } from "@prisma/client";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";

interface JudgeRemark {
  id: string;
  judgeName: string | null;
  judgeType: JudgeType | null;
  remarkPoints: string[];
  date: Date | string | null;
}

interface TeamWithRemarks {
  id: string;
  teamNo: number;
  name: string;
  track?: string; // Make track optional to match API response
  remarks: JudgeRemark[];
}

export default function RemarksTab() {
  // Filter state
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Updated to use a more specific query that returns properly structured data
  const { data: teamsWithRemarks, isLoading, error } = api.remark.getTeamsWithRemarks.useQuery();
  
  // Extract unique tracks for filter dropdown
  const tracks = useMemo(() => {
    if (!teamsWithRemarks) return [];
    const uniqueTracks = new Set<string>();
    teamsWithRemarks.forEach(team => {
      if (team.track) uniqueTracks.add(team.track);
    });
    return Array.from(uniqueTracks).sort();
  }, [teamsWithRemarks]);
  
  // Apply filters to teams
  const filteredTeams = useMemo(() => {
    if (!teamsWithRemarks) return [];
    
    return teamsWithRemarks.filter(team => {
      // Track filter
      if (selectedTrack && team.track !== selectedTrack) return false;
      
      // Search term filter (team name or number)
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const nameMatch = team.name.toLowerCase().includes(search);
        const numberMatch = team.teamNo.toString().includes(search);
        if (!nameMatch && !numberMatch) return false;
      }
      
      return true;
    });
  }, [teamsWithRemarks, selectedTrack, searchTerm]);
  
  if (isLoading) return (
    <div className="flex justify-center items-center p-8">
      <Spinner />
    </div>
  );

  if (error) return (
    <div className="p-4 md:p-6">
      <div className="bg-red-900/20 border border-red-700 p-4 rounded-lg">
        <p className="text-red-500">Error loading remarks: {error.message}</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-4xl text-center  font-semibold mb-6">Team Remarks</h2>
      
      {/* Filters section */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium mb-1 text-gray-400">Filter by Track</label>
          <select 
            className="w-full bg-transparent text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
          >
            <option value="">All Tracks</option>
            {tracks.map(track => (
              <option  key={track} value={track}>{track}</option>
            ))}
          </select>
        </div>
        
        <div className="w-full md:w-2/3">
          <label className="block text-sm font-medium mb-1 text-gray-400">Search Teams</label>
          <div className="relative">
            <div className="absolute  inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search by team name or number..."
              className="w-full border bg-transparent text-white border-gray-700 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {filteredTeams.length > 0 ? (
        <div className="space-y-8">
          {filteredTeams.map((team: TeamWithRemarks) => (
            <div key={team.id} className="p-4 rounded-lg shadow border border-gray-700">
              <div className="mb-4 pb-2 border-b border-gray-700">
                <h3 className="text-xl font-medium">
                  Team {team.teamNo}: {team.name}
                </h3>
                {team.track && <p className="text-sm text-gray-400">Track: {team.track}</p>}
              </div>
              
              {team.remarks && team.remarks.length > 0 ? (
                <div className="space-y-4">
                  {team.remarks.map((remark: JudgeRemark) => (
                    <div key={remark.id} className="p-3 rounded border border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-purple-400 font-medium">
                          {remark.judgeName ?? "Unknown Judge"}
                        </span>
                        <span className="text-xs text-gray-500 border border-gray-600 px-2 py-1 rounded">
                          {remark.judgeType?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="pl-3">
                        {remark.remarkPoints && remark.remarkPoints.length > 0 ? (
                          <ul className="list-disc space-y-1 text-sm pl-4">
                            {remark.remarkPoints.map((point: string, idx: number) => (
                              <li key={idx}>{point}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 italic">No remark content</p>
                        )}
                      </div>
                      <div className="text-right mt-2">
                        <span className="text-xs text-gray-500">
                          {remark.date && new Date(remark.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic p-4 text-center">No remarks for this team</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-gray-700 p-8 rounded-lg text-center">
          <p className="text-gray-400">
            {teamsWithRemarks && teamsWithRemarks.length > 0 
              ? "No teams match your current filters." 
              : "No teams with remarks found."}
          </p>
        </div>
      )}
    </div>
  );
}
