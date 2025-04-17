import { useState } from "react";
import { api } from "~/utils/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { type PaymentStatus, type Tracks } from "@prisma/client";
import { Skeleton } from "../ui/skeleton";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import MemberDetailsDialog from "./MemberDetailsDialog";
import { Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';

const trackColors: Record<Tracks, string> = {
  FINTECH: "bg-blue-100 text-blue-800",
  SUSTAINABLE_DEVELOPMENT: "bg-green-100 text-green-800",
  HEALTHCARE: "bg-red-100 text-red-800",
  LOGISTICS: "bg-yellow-100 text-yellow-800",
  OPEN_INNOVATION: "bg-purple-100 text-purple-800",
  ALL: "bg-gray-100 text-gray-800",
};


export default function TeamLeaderboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentQuery, setPaymentQuery] = useState("ALL");
  const [top60Query, setTop60Query] = useState("ALL"); // Changed from "TOP 60" to "ALL"
  const [submissionQuery, setSubmissionQuery] = useState("ALL");
  const [trackQuery, setTrackQuery] = useState("ALL");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);

  const { data: teams, isLoading } = api.team.getTeamsByTotalScore.useQuery();

  // Function to handle opening the PDF in a new tab with correct URL
  const handleViewPdf = (url: string | undefined) => {
    if (url) {
      // Ensure the URL is not malformed by removing any unwanted parts
      const cleanUrl = url.split(';')[0]; // Take only the part before any semicolon
      window.open(cleanUrl, "_blank");
    }
  };

  // Function to convert filtered teams data to CSV
  const convertToCSV = (teams: typeof filteredTeams) => {
    if (!teams || teams.length === 0) return "";
    
    // Define CSV headers
    const headers = [
      "Rank",
      "Team ID",
      "Team Name",
      "College",
      "Track",
      "Payment Status",
      "Selection Status",
      "Total Score",
      "Member Names",
      "Member Emails",
      "Team Leader Contact"
    ];
    
    // Create CSV content
    const csvRows = teams.map((team, index) => {
      const memberNames = team.Members.map(member => member.name ?? "Unknown").join("; ");
      const memberEmails = team.Members.map(member => member.email ?? "Unknown").join("; ");
      const teamLeaderContact = team.Members.find(member => member.isLeader)?.phone ?? "Not provided";
      
      return [
        index + 1,
        team.id,
        team.name,
        team.Members[0]?.College?.name ?? "Unknown",
        team.IdeaSubmission?.track ?? "Not Submitted",
        team.paymentStatus,
        team.teamProgress === "SELECTED" ? "TOP 60" : 
          team.teamProgress === "SEMI_SELECTED" ? "TOP 100" : "Not Selected",
        team.totalScore,
        memberNames,
        memberEmails,
        teamLeaderContact
      ];
    });
    
    // Convert to CSV string
    const csvContent = [
      headers.join(","),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    return csvContent;
  };
  
  // Function to download CSV file
  const downloadCSV = () => {
    if (!filteredTeams || filteredTeams.length === 0) return;
    
    const csvContent = convertToCSV(filteredTeams);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `teams-export-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to download Excel file
  const downloadExcel = () => {
    if (!filteredTeams || filteredTeams.length === 0) return;
    
    // Create worksheet data
    const worksheetData = filteredTeams.map((team, index) => {
      const memberNames = team.Members.map(member => member.name ?? "Unknown").join("; ");
      const memberEmails = team.Members.map(member => member.email ?? "Unknown").join("; ");
      const teamLeaderContact = team.Members.find(member => member.isLeader)?.phone ?? "Not provided";
      
      return {
        "Rank": index + 1,
        "Team ID": team.id,
        "Team Name": team.name,
        "College": team.Members[0]?.College?.name ?? "Unknown",
        "Track": team.IdeaSubmission?.track ?? "Not Submitted",
        "Payment Status": team.paymentStatus,
        "Selection Status": team.teamProgress === "SELECTED" ? "TOP 60" : 
          team.teamProgress === "SEMI_SELECTED" ? "TOP 100" : "Not Selected",
        "Total Score": team.totalScore,
        "Member Names": memberNames,
        "Member Emails": memberEmails,
        "Team Leader Contact": teamLeaderContact
      };
    });
    
    // Create workbook and add worksheet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const workbook = XLSX.utils.book_new();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const worksheet = XLSX.utils.json_to_sheet(worksheetData as XLSX.Sheet2JSONOpts[]);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teams");
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `teams-export-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  // Apply filters
  const filteredTeams = teams?.filter(team => {
    // Search filter
    if (searchQuery && 
      !team.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !team.id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Payment status filter
    if (paymentQuery !== "ALL") {
      const status = paymentQuery as PaymentStatus;
      if (team.paymentStatus !== status) {
        return false;
      }
    }

    // Team progress/selection filter
    if (top60Query !== "ALL") {
      if (top60Query === "TOP 60" && team.teamProgress !== "SELECTED") {
        return false;
      }
      if (top60Query === "TOP 100" && team.teamProgress !== "SEMI_SELECTED") {
        return false;
      }
      if (top60Query === "NOT SELECTED" && team.teamProgress !== "NOT_SELECTED") {
        return false;
      }
    }

    // Idea submission filter
    if (submissionQuery !== "ALL") {
      if (submissionQuery === "SUBMITTED" && !team.IdeaSubmission) {
        return false;
      }
      if (submissionQuery === "NOT SUBMITTED" && team.IdeaSubmission) {
        return false;
      }
    }

    // Track filter
    if (trackQuery !== "ALL" && team.IdeaSubmission) {
      if (team.IdeaSubmission.track !== trackQuery) {
        return false;
      }
    }

    return true;
  });

  const handleReset = () => {
    setPaymentQuery("ALL");
    setSearchQuery("");
    setSubmissionQuery("ALL");
    setTop60Query("ALL");
    setTrackQuery("ALL");
  };

  return (
    <>
      <Card className="w-full max-w-[1500px] mx-auto mb-4">
        <CardHeader className="pb-3">
          <CardTitle>Search & Filter Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Team ID/Name</p>
              <Input
                placeholder="Search Team ID/Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Idea Submission Status Filter */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Submission Status</p>
              <Select 
                value={submissionQuery} 
                onValueChange={(value) => setSubmissionQuery(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="NOT SUBMITTED">Not Submitted</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {/* Track Filter */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Track</p>
              <Select 
                value={trackQuery} 
                onValueChange={(value) => setTrackQuery(value)}
                disabled={submissionQuery === "NOT SUBMITTED"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Track</SelectLabel>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="FINTECH">Fintech</SelectItem>
                    <SelectItem value="SUSTAINABLE_DEVELOPMENT">Sustainable Development</SelectItem>
                    <SelectItem value="HEALTHCARE">Healthcare</SelectItem>
                    <SelectItem value="LOGISTICS">Logistics</SelectItem>
                    <SelectItem value="OPEN_INNOVATION">Open Innovation</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {/* Team Selection Filter */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Selection Status</p>
              <Select 
                value={top60Query} 
                onValueChange={(value) => setTop60Query(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="TOP 60">Top 60</SelectItem>
                    <SelectItem value="TOP 100">Top 100</SelectItem>
                    <SelectItem value="NOT SELECTED">Not Selected</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {/* Payment Status Filter */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Payment Status</p>
              <Select 
                value={paymentQuery} 
                onValueChange={(value) => setPaymentQuery(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>            
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="VERIFY">Verify</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            {(searchQuery !== "" || paymentQuery !== "ALL" || top60Query !== "ALL" || submissionQuery !== "ALL" || trackQuery !== "ALL") && (
              <Button
                variant="destructive"
                onClick={handleReset}
              >
                Reset Filters
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={downloadCSV}
              disabled={!filteredTeams || filteredTeams.length === 0}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>

            <Button
              variant="outline"
              onClick={downloadExcel}
              disabled={!filteredTeams || filteredTeams.length === 0}
              className="flex items-center gap-1"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="w-full max-w-[1500px] mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Team Rankings by Validator Scores</CardTitle>
          <div className="text-sm text-muted-foreground">
            {filteredTeams?.length ?? 0} teams
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[1200px]">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Track</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Selection</TableHead>
                  {submissionQuery === "SUBMITTED" && (
                    <TableHead className="text-center">Actions</TableHead>
                  )}
                  <TableHead className="text-right">Total Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeams?.map((team, index) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>
                      <div 
                        className="flex -space-x-2 cursor-pointer"
                        onClick={() => {
                          setSelectedTeamId(team.id);
                          setMemberDialogOpen(true);
                        }}
                        title="Click to see member details"
                      >
                        {team.Members.map((member) => (
                          <Avatar key={member.id} className="h-8 w-8 border-2 border-white">
                            <AvatarImage src={member.image ?? ""} alt={member.name ?? ""} />
                            <AvatarFallback>
                              {member.name?.charAt(0) ?? "U"}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {team.Members[0]?.College?.name ?? "Unknown"}
                    </TableCell>
                    <TableCell>
                      {team.IdeaSubmission?.track ? (
                        <Badge className={trackColors[team.IdeaSubmission.track]}>
                          {team.IdeaSubmission.track.replace("_", " ")}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not Submitted</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={team.paymentStatus === "PAID" ? "default" : 
                                team.paymentStatus === "VERIFY" ? "secondary" : "destructive"}
                      >
                        {team.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={team.teamProgress === "SELECTED" ? "default" : 
                                team.teamProgress === "SEMI_SELECTED" ? "secondary" : "outline"}
                      >
                        {team.teamProgress === "SELECTED" ? "TOP 60" : 
                         team.teamProgress === "SEMI_SELECTED" ? "TOP 100" : "Not Selected"}
                      </Badge>
                    </TableCell>
                    {submissionQuery === "SUBMITTED" && (
                      <TableCell className="text-center">
                        {team.IdeaSubmission?.pptUrl && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewPdf(team.IdeaSubmission?.pptUrl)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View PDF
                          </Button>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-right font-bold">{team.totalScore}</TableCell>

                  </TableRow>
                ))}
                {filteredTeams?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={submissionQuery === "SUBMITTED" ? 9 : 8} className="text-center py-4">
                      No teams found matching the filter criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Member Details Dialog */}
      <MemberDetailsDialog 
        isOpen={memberDialogOpen} 
        onClose={() => setMemberDialogOpen(false)}
        teamId={selectedTeamId}
      />
    </>
  );
}

function LeaderboardSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="h-8 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
