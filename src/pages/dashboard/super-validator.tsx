import DownloadDataButtons from "~/components/downloadData";
import FaqAdmin from "~/components/faq/faqAdmin";
import DashboardLayout from "~/components/layout/dashboardLayout";
import TopTeams from "~/components/participantsTable/topTeams";
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
import  topTeams  from "~/components/participantsTable/topTeams";
export default function Organiser() {
  const res = api.superValidator.getTop100.useQuery();
  const users = api.user.getAllUsers.useQuery().data;
  

  const allTeams = res.data;
  const [selectedTeams, setSelectedTeams] = useState(res.data);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paymentQuery, setPaymentQuery] = useState("ALL");
  const [top60Query, setTop60Query] = useState("ALL");
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
    (data.user.role !== "ORGANISER" && data.user.role !== "ADMIN")
  ) {
    return <NotFound />;
  }

  return (
    <DashboardLayout>
      <Tabs defaultValue="teams" className="w-full">
        <TabsContent value="teams">
          <div className="w-full border-b">
            <h1 className="py-10 text-center text-4xl font-bold">Super - Validator</h1>
          </div>
          <div className="m-auto overflow-x-scroll md:max-w-screen-xl">
            <h1 className="my-8 text-center text-2xl font-bold">
              Teams in top 100
            </h1>
            <div className="my-4 flex h-full w-full flex-col items-center justify-around gap-3 md:flex-row">
              
              {/* {data.user.role === "ADMIN" && (
                <Button
                  onClick={async () => {
                    await revalidateScores.mutateAsync();
                  }}
                >
                  Revalidate Scores
                </Button>
              )} */}
              <Sheet>
                <SheetTrigger>
                  <Button>
                    Filters
                    {(searchQuery !== "" ||
                      paymentQuery !== "ALL" ||
                      top60Query !== "ALL" ||
                      submissionQuery !== "ALL" ||
                      trackQuery !== "ALL") &&
                      " (Applied)"}
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-slate-950 ">
                  <SheetHeader>
                    <SheetTitle className="text-white">Filters</SheetTitle>
                    <SheetDescription className="flex flex-col items-center justify-center gap-10">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Label>Team ID/Name</Label>
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
                        <Label>Idea Submission Status</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">{submissionQuery}</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>
                              Submission Status
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup
                              value={submissionQuery}
                              onValueChange={(value: string) =>
                                setSubmissionQuery(value)
                              }
                            >
                              <DropdownMenuRadioItem value="ALL">
                                All
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="SUBMITTED">
                                Submitted
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="NOT SUBMITTED">
                                Not Submitted
                              </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Label>
                          Track Choosen
                          {submissionQuery === "NOT SUBMITTED" && " (N A)"}
                        </Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            disabled={submissionQuery === "NOT SUBMITTED"}
                          >
                            <Button variant="outline">{trackQuery}</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>
                              Submission Status
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
                        <Label>Selection of Teams</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">{top60Query}</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>
                              Shortlist Status
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup
                              value={top60Query}
                              onValueChange={(value: string) =>
                                setTop60Query(value)
                              }
                            >
                              <DropdownMenuRadioItem value="ALL">
                                All
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="TOP 60">
                                Top 60
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="TOP 100">
                                Top 100
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="NOT SELECTED">
                                Not Selected
                              </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Label>Payment Status</Label>
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
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            </div>
            {!res ? (
                <Spinner size="large" />
            ) : (
                <TopTeams
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
