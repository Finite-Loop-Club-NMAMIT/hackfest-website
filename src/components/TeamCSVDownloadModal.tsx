import { useState, useEffect, useCallback, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import { TeamProgress, type PaymentStatus, type Dormitory, type Arena, type Tracks, type TshirtSize, type States } from "@prisma/client";
import { Loader2 } from "lucide-react";

// Define proper types for the team data to match what comes from the API
interface CollegeInfo {
  name: string;
  state: States;
}

interface TeamMember {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  tShirtSize: TshirtSize;
  isLeader: boolean;
  github: string | null;
  attended: boolean;
  College: CollegeInfo | null;
}

interface IdeaSubmission {
  track: Tracks;
  pptUrl: string;
}

interface TeamData {
  id: string;
  name: string;
  teamNo: number;
  teamProgress: TeamProgress;
  attended: boolean;
  paymentStatus: PaymentStatus;
  boysDormitory: Dormitory | null;
  girlsDormitory: Dormitory | null;
  arena: Arena | null;
  IdeaSubmission: IdeaSubmission | null;
  Members: TeamMember[];
}

export const TeamCSVDownloadModal = ({
  isOpen,
  closeModal
}: {
  isOpen: boolean;
  closeModal: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fixed columns - updated to include team members and contact information
  const selectedColumns = useMemo(() => [
    "teamNo", 
    "name", 
    "status", 
    "college", 
    "state", 
    "members", 
    "leaderName", 
    "leaderContact"
  ], []);

  // Set default filters - also wrap this in useMemo
  const progressFilter = useMemo(() => [
    TeamProgress.SELECTED, 
    TeamProgress.TOP15,
    TeamProgress.WINNER,
    TeamProgress.RUNNER,
    TeamProgress.SECOND_RUNNER,
    TeamProgress.TRACK
  ], []);
  
  // Only attended teams
  const attendedOnly = true;

  const teamsQuery = api.organiser.getTeamsForReport.useQuery(
    {
      progressFilter,
      attendedOnly
    },
    { enabled: isOpen }
  );
  
  // Helper function to generate CSV content
  const generateCSVContent = useCallback((teams: unknown, selectedColumns: string[]): string => {
    // Cast to the correct type
    const typedTeams = teams as TeamData[];
    
    // Define header row
    const headers: Record<string, string> = {
      teamNo: "Team Number",
      name: "Team Name",
      status: "Status",
      college: "College",
      state: "State",
      members: "Team Members",
      leaderName: "Team Leader",
      leaderContact: "Leader Contact"
    };

    // Create header row
    const headerRow = selectedColumns.map(col => `"${headers[col]}"`).join(',');
    
    // Create data rows
    const rows = typedTeams.map(team => {
      const row: string[] = [];
      
      selectedColumns.forEach(col => {
        switch (col) {
          case "teamNo":
            row.push(`"${team.teamNo}"`);
            break;
          case "name":
            row.push(`"${team.name}"`);
            break;
          case "status":
            row.push(`"${team.teamProgress}"`);
            break;
          case "college":
            // Get unique college names from team members
            const colleges = [...new Set(team.Members
              .map((m: TeamMember) => m.College?.name)
              .filter(Boolean))];
            row.push(`"${colleges.join(", ") || "N/A"}"`);
            break;
          case "state":
            // Get unique states from team members' colleges
            const states = [...new Set(team.Members
              .map((m: TeamMember) => m.College?.state)
              .filter(Boolean))];
            row.push(`"${states.join(", ") || "N/A"}"`);
            break;
          case "members":
            // Format all team members with leader indicator
            const membersList = team.Members.map(m => 
              `${m.name ?? "Unknown"}${m.isLeader ? " (Leader)" : ""}`
            ).join(", ");
            row.push(`"${membersList}"`);
            break;
          case "leaderName":
            // Get the team leader's name
            const leader = team.Members.find(m => m.isLeader);
            row.push(`"${leader?.name ?? "Unknown"}"`);
            break;
          case "leaderContact":
            // Get the team leader's phone number
            const leaderContact = team.Members.find(m => m.isLeader);
            row.push(`"${leaderContact?.phone ?? "N/A"}"`);
            break;
          default:
            row.push(`""`);
        }
      });
      
      return row.join(',');
    });
    
    return [headerRow, ...rows].join('\n');
  }, []);

  // Download CSV function - defined before useEffect
  const downloadCSV = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!teamsQuery.data) {
        await teamsQuery.refetch();
      }

      const teams = teamsQuery.data;
      
      if (!teams || teams.length === 0) {
        throw new Error("No teams found matching the criteria");
      }

      // Generate CSV - use const instead of let as it's never reassigned
      const csv = generateCSVContent(teams, selectedColumns);
      
      // Create and download the file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `hackfest-teams-${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      closeModal();
    } catch (error) {
      console.error("Error downloading CSV:", error);
      setError(error instanceof Error ? error.message : "Failed to download CSV");
    } finally {
      setIsLoading(false);
    }
  }, [teamsQuery, selectedColumns, generateCSVContent, closeModal]);

  // Effect hook to auto-download when modal opens
  useEffect(() => {
    // Auto-download when modal opens and data is loaded
    if (isOpen && teamsQuery.data && !isLoading) {
      void downloadCSV();
    }
  }, [isOpen, teamsQuery.data, isLoading, downloadCSV]);

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
          <div className="fixed inset-0 bg-black bg-opacity-50" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-100"
                >
                  Downloading Teams CSV
                </Dialog.Title>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-300">
                    {isLoading 
                      ? "Preparing your download..." 
                      : error 
                        ? `Error: ${error}` 
                        : "Your file will download automatically."}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    The CSV will include team number, team name, status, college, state, all team members with leader indicated, and team leader contact information.
                  </p>
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                  {error && (
                    <Button 
                      onClick={downloadCSV} 
                      disabled={isLoading}
                      className="bg-blue-600 text-white hover:bg-blue-700 mr-2"
                    >
                      Try Again
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={closeModal} 
                    className="bg-transparent border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-gray-100"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Preparing...
                      </>
                    ) : "Close"}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
