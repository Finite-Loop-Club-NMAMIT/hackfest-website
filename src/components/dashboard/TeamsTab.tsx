/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import ParticipantsTable from "~/components/participantsTable";
import Spinner from "~/components/spinner";
import FilterSheet from "~/components/organiserDashboard/filterSheet";
import GithubSheet from "~/components/organiserDashboard/githubSheet";
import TeamLeaderboard from "./TeamLeaderboard";

export default function TeamsTab() {
  const res = api.team.getTeamsList.useQuery();
  const top15 = api.team.top15.useQuery().data;
  const allTeams = res.data;
  const [selectedTeams, setSelectedTeams] = useState(top15);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paymentQuery, setPaymentQuery] = useState("ALL");
  const [top60Query, setTop60Query] = useState("TOP 60");
  const [submissionQuery, setSubmissionQuery] = useState("ALL");
  const [trackQuery, setTrackQuery] = useState("ALL");

  const filterSheetProps = {
    searchQuery, paymentQuery, top60Query, submissionQuery, trackQuery,
    setSearchQuery, setPaymentQuery, setTop60Query, setSubmissionQuery, setTrackQuery,
  };

  useEffect(() => {
    // ...existing filter effect code...
  }, [res.data, searchQuery, paymentQuery, top60Query, submissionQuery, trackQuery, allTeams]);

  return (
    <div>
      <div className="w-full">
        <h1 className="py-10 text-center text-4xl font-bold">Participants</h1>
      </div>
      <div className="m-auto overflow-x-scroll md:max-w-screen-xl">
        <div className="my-4 flex h-full w-full flex-col items-center justify-around gap-3 md:flex-row">
          <GithubSheet />
        </div>
        {!res ? (
          <Spinner size="large" />
        ) : (
          // <ParticipantsTable data={selectedTeams} dataRefecth={res.refetch} />
          <TeamLeaderboard />
        )}
      </div>
    </div>
  );
}
