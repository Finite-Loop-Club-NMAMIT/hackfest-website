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
import { Input } from "~/components/ui/input";
import { useEffect, useState } from "react";
import Spinner from "~/components/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { useSession } from "next-auth/react";
import NotFound from "../404";
import JudgePanel from "~/components/organiserDashboard/judgePanel";
import VolunteerPanel from "~/components/organiserDashboard/volunteerPanel";
import { TeamProgress } from "@prisma/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Label } from "@radix-ui/react-label";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import PaymentVerification from "~/components/adminDashboard/paymentVerification";
import Top60Table from "~/components/tables/top60Table";
export default function Organiser() {
  const res = api.team.getTeamsList.useQuery();
  const users = api.user.getAllUsers.useQuery().data;

  const allTeams = res.data;
  const [selectedTeams, setSelectedTeams] = useState(res.data);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paymentQuery, setPaymentQuery] = useState("ALL");
  const [top60Query, setTop60Query] = useState("TOP 60");
  const [submissionQuery, setSubmissionQuery] = useState("ALL");
  const [trackQuery, setTrackQuery] = useState("ALL");

  const { data, status } = useSession();

  

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
    (data.user.role !== "ADMIN")
  ) {
    return <NotFound />;
  }

  return (
    <DashboardLayout>
      <Tabs defaultValue="top60" className="w-full">
       <TabsList className="w-full">
        <TabsTrigger value="top60" className="w-full">
            Top 60
        </TabsTrigger>
        <TabsTrigger value="paymentVerification" className="w-full">
            Verify Payment
        </TabsTrigger>
       </TabsList>

        <TabsContent value="top60">
        <div className="w-full border-b">
            <h1 className="py-10 text-center text-4xl font-bold z-10">Admin</h1>
          </div>
          <div className="m-auto overflow-x-scroll md:max-w-screen-xl">
            
            <div className="my-4 flex h-full w-full flex-col items-center justify-around gap-3 md:flex-row">
            <div className="flex flex-col items-center justify-center gap-3">
                        <Input
                          placeholder="Search Team ID/Name"
                          className="w-52"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                          }} 
                        />
                </div>

                <div className="flex flex-col items-center justify-center gap-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            disabled={submissionQuery === "NOT SUBMITTED"}
                          >
                            <Button variant="outline">{trackQuery}</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>
                              Track
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup
                              value={trackQuery}
                              onValueChange={(value: string) =>
                                setTrackQuery(value)
                              }
                            >
                              <DropdownMenuRadioItem value="ALL">
                                All
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="FINTECH">
                                Fintech
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="SUSTAINABLE_DEVELOPMENT">
                                Sustainable Development
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="HEALTHCARE">
                                Healthcare
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="METAVERSE">
                                Metaverse
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="LOGISTICS">
                                Logistics
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="OPEN_INNOVATION">
                                Open Innovation
                              </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex flex-col items-center justify-center gap-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">{paymentQuery}</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Payment Staus</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup
                              value={paymentQuery}
                              onValueChange={(value: string) =>
                                setPaymentQuery(value)
                              }
                            >
                              <DropdownMenuRadioItem value="ALL">
                                All
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="PAID">
                                Paid
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="PENDING">
                                Pending
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="FAILED">
                                Failed
                              </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <Button
                        variant="destructive"
                        onClick={() => {
                          setPaymentQuery("ALL");
                          setSearchQuery("");
                          setSubmissionQuery("ALL");
                          setTop60Query("ALL");
                          setTrackQuery("ALL");
                        }}
                      >
                        RESET
                      </Button>
              {/* <DownloadDataButtons /> */}
              {/* {data.user.role === "ADMIN" && (
                <Button
                  onClick={async () => {
                    await revalidateScores.mutateAsync();
                  }}
                >
                  Revalidate Scores
                </Button>
              )} */}
              
            </div>
            {!res ? (
              <Spinner size="large" />
            ) : (
              <Top60Table
                data={res.data?.filter(team => team.teamProgress === 'SELECTED')}
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

            <TabsContent value="paymentVerification">
                <PaymentVerification data={res.data?.filter(item => item.paymentStatus === 'PENDING' && item.transactionId)}
                dataRefecth={res.refetch}/>
            </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
