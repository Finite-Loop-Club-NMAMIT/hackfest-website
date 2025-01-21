import { useContext, useState, useTransition } from "react";
import { ProgressContext } from "../../progressProvider";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import {
  Crown,
  Loader2Icon,
  LogOut,
  Trash2,
  UserRoundPlus,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "../../ui/badge";
import { toast } from "sonner";
import { AiOutlineCopy } from "react-icons/ai";
import { BsWhatsapp } from "react-icons/bs";
import { type Progress } from "@prisma/client";
import { useRouter } from "next/navigation";
import { type inferRouterOutputs } from "@trpc/server";
import { type teamRouter } from "~/server/api/routers/team";
import { api } from "~/utils/api";
import { env } from "~/env";
import FinalSubmission from "~/components/finalSubmission";
import ResumeGithubModal from "~/components/finalSubmission/resumeGithubModal";
import AddVideoSubmission from "~/components/addVideoSubmission";

export default function TeamInfo({
  teamdata,
  userId,
  userProgress,
  refetchTeam,
  userIsLeader,
  userRefetch,
}: {
  teamdata:
    | inferRouterOutputs<typeof teamRouter>["getTeamDetailsById"]
    | null
    | undefined;
  userId: string;
  userProgress: Progress;
  userIsLeader: boolean;
  refetchTeam?: () => void;
  userRefetch?: () => void;
}) {
  const { currentState } = useContext(ProgressContext);
  const [isLoading, setIsLoading] = useState(false);

  const deleteTeam = api.team.deleteTeam.useMutation({
    onSuccess: () => {
      userRefetch?.();
      refetchTeam?.();
    },
  });
  const leaveTeam = api.team.leaveTeam.useMutation({
    onSuccess: () => {
      userRefetch?.();
      refetchTeam?.();
    },
  });

  if (currentState !== 1) return <></>;
  const leader = teamdata?.members?.find(
    (member) => member.id === userId && member?.isLeader,
  );

  const teamMembers = teamdata?.members ?? [];

  teamMembers.sort((a, b) =>
    a.isLeader === b.isLeader ? 0 : a.isLeader ? -1 : 1,
  );

  const onSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    setIsLoading(true);
    leader?.isLeader
      ? await deleteTeam.mutateAsync()
      : await leaveTeam.mutateAsync();
    setIsLoading(false);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(teamdata?.id ?? "");
    toast.success("Team ID copied to clipboard", {
      position: "bottom-center",
    });
  };

  function getLabNo(teamNo: number) {
    if (teamNo >= 1 && teamNo <= 10) {
      return "NC-44";
    } else if (teamNo >= 11 && teamNo <= 19) {
      return "NC-45";
    } else if (teamNo >= 20 && teamNo <= 29) {
      return "SMVL-54";
    } else if (teamNo >= 30 && teamNo <= 39) {
      return "SMVL-55";
    } else if (teamNo >= 40 && teamNo <= 43) {
      return "SMVL-53";
    } else if (teamNo >= 44 && teamNo <= 60) {
      return "ADL-04";
    } else {
      return "N/A";
    }
  }

  return (
    <Card className="h-fit w-full">
      <CardHeader>
        <CardTitle className="text-center">Team Details</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-2 px-2">
        <Card className="w-full">
          <CardContent>
            <div className="m-auto my-4 flex flex-col justify-evenly p-0 pt-4 sm:my-auto md:p-4">
              <div className="flex flex-col items-center justify-between gap-3 lg:flex-row lg:gap-0">
                <h1 className="flex items-center justify-center gap-5 text-center text-2xl font-bold uppercase">
                {teamdata?.teamProgress === "SELECTED" && (
                    <span className="border border-white rounded-full w-10 h-10 text-lg font-semibold flex justify-center items-center">{teamdata.teamNo ?? 0}</span>
                  )}
                  {teamdata?.name ?? "Not Available"}  
                </h1>
                {/* <div
                  onClick={copyCode}
                  className="flex cursor-pointer items-center justify-evenly gap-2 rounded-full border px-2 py-1 text-sm transition-colors duration-300 hover:border-white"
                >
                  Copy Team ID
                  <AiOutlineCopy
                    onClick={copyCode}
                    size={20}
                    className="cursor-pointer hover:text-gray-400"
                  />
                </div> */}
                {/* <Button
                  onClick={(e) => {
                    toast.promise(() => onSubmit(e), {
                      position: "bottom-center",
                      loading: leader?.isLeader
                        ? "Deleting Team..."
                        : "Leaving Team...",
                      success: () => {
                        return leader?.isLeader ? "Team Deleted" : "Team Left";
                      },
                      error: () => {
                        return "Something went wrong";
                      },
                    });
                  }}
                  disabled={isLoading || userProgress === "COMPLETE"}
                  className={`${isLoading || userProgress === "COMPLETE" ? "cursor-not-allowed" : ""} ${
                    leader?.isLeader
                      ? "bg-red-600 text-white hover:bg-red-600/90"
                      : ""
                  } flex items-center gap-2`}
                >
                  {isLoading
                    ? "Loading..."
                    : leader?.isLeader
                      ? "Delete Team"
                      : "Leave Team"}
                  {isLoading ? (
                    <Loader2Icon size={16} className="animate-spin" />
                  ) : leader?.isLeader ? (
                    <Trash2 size={16} />
                  ) : (
                    <LogOut size={16} />
                  )}
                </Button> */}
                <div className="flex flex-row items-center justify-center gap-3">
                  {userIsLeader && <AddVideoSubmission />}
                  {/* {teamdata?.transactionId &&
                    teamdata?.paymentStatus === "PAID" && (
                      <Badge className="border border-green-500 bg-green-500/20 text-white">
                        Paid
                      </Badge>
                    )} */}
                  {/* {teamdata?.transactionId &&
                    teamdata?.paymentStatus !== "PAID" && (
                      <Badge className="border border-amber-500 bg-amber-500/20 text-white">
                        Processing
                      </Badge>
                    )} */}
                  {teamdata?.teamProgress === "SELECTED" &&
                    teamdata?.teamNo && (
                      <h3 className="text-xl font-bold">
                        {getLabNo(teamdata.teamNo)}
                      </h3>
                    )}
                  {teamdata?.teamProgress === "SELECTED" &&
                    !teamdata?.transactionId &&
                    userId === teamMembers[0]?.id && (
                      <FinalSubmission
                        refetchTeam={refetchTeam}
                        teamId={teamdata?.id ?? ""}
                        teamlength={teamdata?.members?.length ?? 0}
                      />
                    )}
                  {teamdata?.teamProgress === "SELECTED" &&
                    teamMembers.filter(
                      (member) => !member.resume && !member.github,
                    ).length !== 0 && (
                      <>
                        <ResumeGithubModal
                          refetchTeam={refetchTeam}
                          teamdata={teamdata}
                          userId={userId}
                        />
                      </>
                    )}
                </div>
              </div>
              <div className="w-full">
                {teamMembers.map((member) => {
                  return (
                    <div
                      key={member.id}
                      className="mx-2 mt-5 flex items-center rounded-xl border p-5 md:mx-0"
                    >
                      <div className="md:text-md flex w-full flex-col items-center justify-between gap-3 text-sm lg:flex-row lg:gap-0">
                        <div className="relative">
                          <Image
                            src={member.image!}
                            alt="Profile image"
                            width={50}
                            height={50}
                            className="rounded-xl"
                          />
                          <div className="absolute -top-3 right-0 h-5 w-5 rotate-12">
                            {member?.isLeader && <Crown color="yellow" />}
                          </div>
                        </div>
                        <div className="overflow-hidden truncate text-center">
                          <p className="overflow-hidden truncate font-bold">
                            {member.name}
                          </p>
                          <p className="overflow-hidden truncate text-xs">
                            {member.email}
                          </p>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1">
                          <p className="font-bold">{member.phone}</p>
                          <Badge>{member.isLeader ? "Leader" : "Member"}</Badge>
                        </div>
                      </div>
                    </div>
                  );
                }) || "Not Available"}
              </div>
            </div>
          </CardContent>
        </Card>
        {/* <Card className="mb-2 w-full">
          {teamdata && (
            <CardContent className="text-md flex flex-col items-center justify-between gap-3 pt-5 text-center sm:text-sm md:flex-row md:gap-0">
              {userProgress === "COMPLETE" ? (
                "You have completed Idea Submission"
              ) : 4 - teamdata.members.length === 0 ? (
                <>Your Team is full! Proceed to Idea submission.</>
              ) : (
                <>
                  There&apos;s still room for {4 - teamdata.members.length} more
                  teammate{4 - teamdata.members.length > 1 ? "s" : ""}!
                </>
              )}
              <Dialog>
                <DialogTrigger className="flex items-center gap-2" asChild>
                  <Button
                    size={"sm"}
                    disabled={
                      4 - teamdata.members.length <= 0 ||
                      userProgress === "COMPLETE"
                    }
                  >
                    <UserRoundPlus size={16} /> Add More
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90%] max-w-sm md:w-full">
                  <DialogHeader>
                    <DialogTitle>
                      {4 - teamdata.members.length <= 0 ? (
                        "Your Team is full!"
                      ) : (
                        <>
                          There&apos;s still room for{" "}
                          {4 - teamdata.members.length} more teammate
                          {4 - teamdata.members.length > 1 ? "s" : ""}!
                        </>
                      )}
                    </DialogTitle>
                    <DialogDescription className="mt-2">
                      <div className="flex flex-col justify-center p-5 text-center">
                        <p className="bodyFont text-xs">
                          Share this link with your friends to add them to your
                          team!
                        </p>
                        <div className="mt-2 flex items-center justify-evenly">
                          <input
                            type="url"
                            className="bodyFont w-full max-w-full rounded-lg bg-white bg-opacity-20 p-2 text-sm"
                            value={teamdata?.id}
                          />
                          <AiOutlineCopy
                            onClick={copyCode}
                            size={20}
                            className="cursor-pointer hover:text-gray-400"
                          />
                        </div>

                        <div className="bodyFont flex items-center py-2">
                          <div className="h-px flex-grow bg-gray-600"></div>
                          <span className="flex-shrink px-4 text-sm font-light italic">
                            or
                          </span>
                          <div className="h-px flex-grow bg-gray-600"></div>
                        </div>

                        <a
                          target="_blank"
                          href={`https://wa.me/?text=${encodeURIComponent(
                            `Join my team at Hackfest 2024, 3 Day long Hackathon at NMAMIT, Nitte. Copy this Team ID: ${teamdata?.id}. Register here: ${env.NEXT_PUBLIC_BASE_URL}/register`,
                          )}`}
                          className="bodyFont flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-green-500 p-2 text-sm text-white hover:bg-green-600"
                        >
                          <BsWhatsapp /> Share on WhatsApp
                        </a>
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </CardContent>
          )}
        </Card> */}
      </CardContent>
    </Card>
  );
}
