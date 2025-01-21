import DownloadDataButtons from "~/components/downloadData";
import FaqAdmin from "~/components/faq/faqAdmin";
import DashboardLayout from "~/components/layout/dashboardLayout";
import ParticipantsTable from "~/components/participantsTable";
import { api } from "~/utils/api";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import ReferralsAdmin from "~/components/organiserDashboard/referralsAdmin";
import { useEffect, useState } from "react";
import Spinner from "~/components/spinner";

import { useSession } from "next-auth/react";
import NotFound from "../404";
import JudgePanel from "~/components/organiserDashboard/judgePanel";
import VolunteerPanel from "~/components/organiserDashboard/volunteerPanel";
import { TeamProgress } from "@prisma/client";

import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import FilterSheet from "~/components/organiserDashboard/filterSheet";
import GithubSheet from "~/components/organiserDashboard/githubSheet";
import { Button } from "~/components/ui/button";
export default function Organiser() {
  const res = api.team.getTeamsList.useQuery();
  const users = api.user.getAllUsers.useQuery().data;
  const top15 = api.team.top15.useQuery().data;
  const normalize = api.judges.fuckIt.useMutation({
    onSuccess: () => {
      toast.success("Done")
    },
    onError: (e) => {
      toast.error(e.message)
    }
  })

  const allTeams = res.data;
  const [selectedTeams, setSelectedTeams] = useState(top15);

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
  // const assignteamNumbers = api.organiser.assignTeamNumbers.useMutation({
  //   onSuccess: async () => {
  //     toast.success("Team Numbers assigned successfully");
  //     await res.refetch();
  //   },
  //   onError: () => {
  //     toast.error("Error assigning team numbers");
  //   },
  // })

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
          (team) => !!team.ideaSubmission === (submissionQuery === "SUBMITTED"),
        );
      }

      if (trackQuery !== "ALL" && submissionQuery !== "NOT SUBMITTED") {
        partiallyFiltered = partiallyFiltered?.filter(
          (team) => team.ideaSubmission?.track === trackQuery,
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
  ]);

  // const revalidateScores = api.team.revalidateScore.useMutation({
  //   onSuccess: async () => {
  //     toast.success("Scores revalidated successfully");
  //     await res.refetch();
  //   },
  //   onError: () => {
  //     toast.error("Error revalidating scores");
  //   },
  // });

  if (status === "loading")
    return (
      <DashboardLayout>
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner />
        </div>
      </DashboardLayout>
    );

  if (
    !data ||
    !data.user ||
    (data.user.role !== "ORGANISER" && data.user.role !== "ADMIN")
  ) {
    return <NotFound />;
  }

  return (
    <DashboardLayout>
      <Tabs defaultValue="teams" className="w-full">
        <TabsList className="flex flex-row items-center justify-center">
          <TabsTrigger className="w-full" value="teams">
            Teams
          </TabsTrigger>
          <TabsTrigger className="w-full" value="referrals">
            Referrals
          </TabsTrigger>
          <TabsTrigger className="w-full" value="roles">
            Roles
          </TabsTrigger>
        </TabsList>
        <TabsContent value="teams">
          <div className="w-full border-b">
            <h1 className="py-10 text-center text-4xl font-bold">Organiser</h1>
          </div>
          <div className="my-5 flex flex-col items-center justify-center gap-10 md:flex-row">
            <div className="flex flex-col">
              <span className="text-xl">
                Number of Logins : {users?.length}
              </span>
              <span className="text-xl">
                Number of Teams : {res?.data?.length}
              </span>
              <span className="text-xl">
                Number of Idea submissions :{" "}
                {res?.data?.filter((team) => team.ideaSubmission).length}
              </span>
            </div>
            <FaqAdmin />
          </div>
          <div className="m-auto overflow-x-scroll md:max-w-screen-xl">
            <h1 className="my-8 text-center text-2xl font-bold">
              Participants
            </h1>
            <div className="my-4 flex h-full w-full flex-col items-center justify-around gap-3 md:flex-row">
              <DownloadDataButtons />
              {/* <Button 
                onClick={async () => {
                  await assignteamNumbers.mutateAsync();
                }}
              >
                Assign Team Numbers
              </Button> */}
              {/* {data.user.role === "ADMIN" && (
                <Button
                  onClick={async () => {
                    await revalidateScores.mutateAsync();
                  }}
                >
                  Revalidate Scores
                </Button>
              )} */}
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
          <div>
            {/* <TeamsList
              teams={res?.map((team) => {
                return { id: team.id, teamName: team.name };
              })}
            /> */}
          </div>
        </TabsContent>

        <TabsContent value="referrals">
          <ReferralsAdmin />
        </TabsContent>

        <TabsContent value="roles">
          <JudgePanel users={users} />
          <VolunteerPanel users={users} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
