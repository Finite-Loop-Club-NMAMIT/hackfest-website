import { type Game } from "@prisma/client";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import BGMIRules from "~/components/gameRules/bgmiRules";
import ValoRules from "~/components/gameRules/valoRules";
import Layout from "~/components/layout";
import Spinner from "~/components/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Modal } from "~/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { api } from "~/utils/api";
import NotFound from "../404";
import { AiOutlineCopy } from "react-icons/ai";
import Image from "next/image";
import { Crown } from "lucide-react";
import NotLoggedIn from "~/components/notLoggedIn";

const GamingEvent: NextPage = () => {
  const { data: session, status: sessionStatus } = useSession();

  const [teamName, setTeamName] = useState<string>("");
  const [teamId, setTeamId] = useState<string>("");
  const [game, setGame] = useState<Game>("VALORANT");

  const {
    data: userGameTeam,
    refetch: refetchUserGameTeam,
    isLoading: userGameTeamIsLoading,
  } = api.gamefest.getUserTeam.useQuery();

  const createTeam = api.gamefest.createTeam.useMutation({
    onSuccess: async () => {
      await refetchUserGameTeam();
      toast.dismiss();
      toast.success("Team created successfully");
    },

    onError: ({ message }) => {
      toast.dismiss();
      toast.error(message);
    },
  });

  const joinTeam = api.gamefest.joinTeam.useMutation({
    onSuccess: async () => {
      await refetchUserGameTeam();
      toast.dismiss();
      toast.success("Team joined successfully");
    },

    onError: ({ message }) => {
      toast.dismiss();
      toast.error(message);
    },
  });

  const confirmTeam = api.gamefest.confirmTeam.useMutation({
    onSuccess: async () => {
      await refetchUserGameTeam();
      toast.dismiss();
      toast.success("Team confirmed successfully");
    },

    onError: ({ message }) => {
      toast.dismiss();
      toast.error(message);
    },
  });

  const deleteTeam = api.gamefest.deleteTeam.useMutation({
    onSuccess: async () => {
      await refetchUserGameTeam();
      console.log("hello", userGameTeam);
      toast.dismiss();
      toast.success("Deleted team successfully");
    },

    onError: ({ message }) => {
      toast.dismiss();
      toast.error(message);
    },
  });

  const getTeams = api.gamefest.getTeams.useQuery().data?.filter((item) => item.isConfirmed);
  const leaveTeam = api.gamefest.leaveTeam.useMutation({
    onSuccess: async () => {
      await refetchUserGameTeam();
      toast.dismiss();
      toast.success("Left team successfully");
    },

    onError: ({ message }) => {
      toast.dismiss();
      toast.error(message);
    },
  });

  if (sessionStatus === "loading")
    return (
      <Layout>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[url('/images/noise.svg'),linear-gradient(180deg,#060e3c_0%,#052d4f_30%,#001933_100%)] bg-repeat">
          <div>
            <Spinner size={"large"} />
          </div>
        </div>
      </Layout>
    );

  if (!session) return <NotLoggedIn />;

  if(getTeams && getTeams.length >= 16) return(
    <>
      <Layout>
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[url('/images/noise.svg'),linear-gradient(180deg,#060e3c_0%,#052d4f_30%,#001933_100%)] bg-repeat p-4 pt-20">
        <div className="flex justify-center items-center w-full">
          <h1 className="md:text-5xl text-3xl font-bold">Registrations closed</h1>
        </div>
      </div>
      </Layout>
    </>
  )

  return (
    <Layout>
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[url('/images/noise.svg'),linear-gradient(180deg,#060e3c_0%,#052d4f_30%,#001933_100%)] bg-repeat p-4 pt-20">
        {/* <h1 className="text-center text-6xl font-bold">OVERTIME</h1> */}
        <Image src={'/images/overtime.png'} height={300} width={300} alt="Overtime Banner" className="md:pt-0 pt-4"/>
        <div className="flex flex-row items-center justify-center gap-4">
          <Modal
            title="Valorant Rules"
            buttonContent="Valorant Rules"
            customizable
            className="max-h-[60vh] overflow-scroll bg-slate-950 text-white"
          >
            <ValoRules />
          </Modal>
          {/* <Modal
            title="BGMI Rules"
            buttonContent="BGMI Rules"
            customizable
            className="max-h-[60vh] overflow-scroll bg-slate-950 text-white"
          >
            <BGMIRules />
          </Modal> */}
        </div>
        <div className="mx-5 flex flex-col items-center justify-center gap-10 md:flex-row">
          {userGameTeamIsLoading ? (
            <Card className="flex size-96 flex-col items-center justify-center">
              <CardContent className="flex flex-col items-center justify-center gap-4">
                <Spinner size="large" />
              </CardContent>
              <CardFooter>Loading...</CardFooter>
            </Card>
          ) : userGameTeam ? (
            <Card className="w-full">
              <CardContent>
                <div className="m-auto my-4 flex flex-col justify-evenly gap-3 p-0 pt-4 sm:my-auto md:p-4">
                  <div className="flex flex-col items-center justify-between gap-3 lg:flex-row lg:gap-0">
                    <h1 className="flex items-center justify-center gap-5 text-center text-2xl font-bold uppercase">
                      {userGameTeam.name}
                    </h1>
                    <div className="flex gap-2">
                      <Badge className="border border-red-500 bg-red-500/20 text-white hover:bg-red-500/20">
                        {userGameTeam.game}
                      </Badge>
                      <Badge
                        onClick={async () => {
                          await navigator.clipboard.writeText(userGameTeam.id);
                          toast.success("Copied to clipboard");
                        }}
                        className="flex cursor-pointer items-center justify-evenly gap-2 rounded-full border px-2 py-1 text-sm transition-colors duration-300 hover:border-white"
                      >
                        Copy Team ID
                        <AiOutlineCopy
                          size={20}
                          className="cursor-pointer hover:text-gray-400"
                        />
                      </Badge>
                    </div>
                  </div>

                  <div className="w-full">
                    {userGameTeam.members.map((member) => {
                      return (
                        <div
                          key={member.id}
                          className="mx-2 mt-5 flex items-center rounded-xl border p-5 md:mx-0"
                        >
                          <div className="md:text-md flex w-full flex-col items-center justify-between gap-3 text-sm lg:flex-row lg:gap-0">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Image
                                  src={member.image!}
                                  alt="Profile image"
                                  width={50}
                                  height={50}
                                  className="rounded-xl"
                                />
                                <div className="absolute -top-3 right-0 h-5 w-5 rotate-12">
                                  {member.isGameLeader && (
                                    <Crown color="yellow" />
                                  )}
                                </div>
                              </div>
                              <div className="overflow-hidden truncate text-center">
                                <p className="overflow-hidden truncate font-bold">
                                  {member.name}
                                </p>
                              </div>
                              <div className="flex flex-col items-center justify-center gap-1">
                                <p className="font-bold">{member.phone}</p>
                                <Badge>
                                  {member.isGameLeader ? "Leader" : "Member"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }) || "Not Available"}
                  </div>
                  {!userGameTeam.isConfirmed ? (
                    <Badge className="flex justify-center border border-amber-500 bg-amber-500/20 py-2 text-white hover:bg-amber-500/20">
                      Once confirmed team cannot be edited
                    </Badge>
                  ) : (
                    <Badge className="self-center border bg-green-600 text-white hover:bg-green-600">
                      Team Confirmed
                    </Badge>
                  )}
                  <div className="flex flex-row-reverse justify-between">
                    {session.user.isGameLeader ? (
                      userGameTeam.isConfirmed ? (
                        <></>
                      ) : (
                        <>
                          <Button
                            className="bg-green-600 text-white hover:scale-105 hover:bg-green-700"
                            onClick={() => {
                              toast.loading("Confirming team...");
                              confirmTeam.mutate();
                            }}
                          >
                            Confirm Team
                          </Button>
                          <Button
                            className="hover:scale-105"
                            variant={"destructive"}
                            onClick={() => {
                              toast.loading("Deleting team...");
                              deleteTeam.mutate();
                            }}
                          >
                            Delete Team
                          </Button>
                        </>
                      )
                    ) : (
                      <Button
                        variant={"destructive"}
                        className="hover:scale-105"
                        onClick={() => {
                          toast.loading("Leaving team...");
                          leaveTeam.mutate();
                        }}
                      >
                        Leave Team
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="flex size-72 flex-col items-center justify-center">
                <CardHeader>
                  <CardTitle>Create Team</CardTitle>
                  <CardDescription>Create a team as leader</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-3">
                  <Input
                    placeholder="Team Name"
                    value={teamName}
                    onChange={(e) => {
                      setTeamName(e.target.value);
                    }}
                  />
                  {/* <Select
                    onValueChange={(value) => {
                      setGame(value as "VALORANT" | "BGMI");
                    }}
                    defaultValue="VALORANT"
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Game" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VALORANT">Valorant</SelectItem>
                      <SelectItem value="BGMI">BGMI</SelectItem>
                    </SelectContent>
                  </Select> */}
                  <Button
                    onClick={() => {
                      if (!teamName) {
                        toast.error("Please enter a team name");
                        return;
                      }
                      if (!session.user.email?.endsWith("nmamit.in")) {
                        toast.error("Please login with your college email");
                        return;
                      }
                      toast.loading("Creating team...");
                      createTeam.mutate({ teamName: teamName, game: game });
                    }}
                  >
                    Create Team
                  </Button>
                </CardContent>
              </Card>
              <Card className="flex size-72 flex-col items-center justify-center">
                <CardHeader>
                  <CardTitle>Join Team</CardTitle>
                  <CardDescription>Join team as member</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-3">
                  <Input
                    placeholder="Team Id"
                    value={teamId}
                    onChange={(e) => {
                      setTeamId(e.target.value);
                    }}
                  />
                  <Button
                    onClick={() => {
                      if (!teamId) {
                        toast.error("Please enter a valid Team ID");
                        return;
                      }
                      if (!session.user.email?.endsWith("nmamit.in")) {
                        toast.error("Please login with your college email");
                        return;
                      }
                      toast.loading("Joining team");
                      joinTeam.mutate({ teamId });
                    }}
                  >
                    Join Team
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default GamingEvent;
