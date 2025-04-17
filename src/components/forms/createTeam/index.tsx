/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { toast } from "sonner";
import gsap from "gsap";
import { useSession } from "next-auth/react";
import type { Team } from "@prisma/client";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { ClipboardCopy, RefreshCcw } from "lucide-react";
import TeamList from "~/components/team/teamList";
import { BsWhatsapp } from "react-icons/bs";

export default function RegisterTeamForm() {
  const { data, update } = useSession();
  const params = useSearchParams();
  const router = useRouter();

  const createTeamMutation = api.team.createTeam.useMutation({
    onSuccess: (data) => {
      setTeamDetails(data.team as Team);
      setIsCreateDialogOpen(true);
      gsap.set("#form.title", { innerText: "Team Created" });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const joinTeamMutation = api.team.joinTeam.useMutation({
    onSuccess: (data) => {
      setTeamDetails(data.team as Team);
      setIsJoined(true);
      gsap.set("#form.title", { innerText: "Team Joined" });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // New useState variables replacing react-hook-form controls
  const [createTeamName, setCreateTeamName] = useState<string>("");
  const [joinTeamId, setJoinTeamId] = useState<string>("");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTeamId, setSearchTeamId] = useState<string>("");
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [teamDetailsTimeout, setTeamDetailsTimeout] =
    useState<NodeJS.Timeout>();
  const [teamDetails, setTeamDetails] = useState<Team | null>(null);
  const getTeamNames = api.team.fetchTeamNames.useQuery();

  useEffect(() => {
    const teamQuery = params.get("teamId");
    if (teamQuery) {
      setJoinTeamId(teamQuery);
    }
  }, [params]);

  function onCreateTeamSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createTeamMutation.mutate({ teamName: createTeamName });
  }
  function onJoinTeamSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    joinTeamMutation.mutate({ teamId: joinTeamId });
  }

  function getTeamDetailsHandler(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.currentTarget.value;
    setJoinTeamId(value);
    if (value) {
      if (teamDetailsTimeout) {
        clearTimeout(teamDetailsTimeout);
      }
      const timeout = setTimeout(() => {
        setSearchTeamId(value);
      }, 500);
      setTeamDetailsTimeout(timeout);
    } else {
      setSearchTeamId("");
      if (teamDetailsTimeout) {
        clearTimeout(teamDetailsTimeout);
      }
    }
  }

  return (
    <>
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(value) => {
          if (!value) {
            void router.replace("/profile");
            void update();
          }
          setIsCreateDialogOpen(value);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-3xl">
              Team Created
            </DialogTitle>
            <DialogDescription className="mt-4">
              <p className="text-center md:text-lg">
                Your team,{" "}
                <span className="font-extrabold">
                  {teamDetails?.name ?? "New Team"}
                </span>
                , has been created successfully🥳. Use the code below to invite
                your fellow members.
              </p>
              <div className="flex flex-col gap-4">
                <div
                  className="relative mt-4 flex cursor-pointer flex-row flex-nowrap"
                  onClick={async () => {
                    if (teamDetails?.name) {
                      await window.navigator.clipboard.writeText(
                        teamDetails.id ?? "",
                      );
                      toast.info("Code copied successfully!");
                    } else {
                      toast.error("Failed to copy code!");
                    }
                  }}
                >
                  <Input
                    value={teamDetails?.id ?? "code not available"}
                    className="cursor-pointer truncate pr-10 text-left"
                    readOnly
                  />
                  <ClipboardCopy className="absolute right-1 top-1 size-8 rounded-r-md p-1" />
                </div>
                <a
                  className="flex items-center justify-center gap-2 rounded-full border border-green-500 bg-green-500/50 px-4 py-2 text-xs font-semibold text-green-500 backdrop-blur-2xl duration-300 hover:scale-105 hover:bg-green-500/70"
                  href={`https://wa.me/?text=${encodeURIComponent(`Join my team ${teamDetails?.name} for Hackfest '25. https://hackfest.dev/register?teamId=${teamDetails?.id}`)}`}
                  target="_blank"
                >
                  <BsWhatsapp />
                  Share on WhatsApp
                </a>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isJoined}
        onOpenChange={(value) => {
          if (!value) {
            void router.replace("/profile");
            void update();
          }
          setIsJoined(value);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-3xl">
              Team Joined
            </DialogTitle>
            <DialogDescription className="mt-4">
              <p className="text-center md:text-lg">
                Congratulations{" "}
                <span>{data?.user.name ?? "Tech Enthusiast"}</span> 🥳! You have
                successfully joined {teamDetails?.name ?? "your team"}
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="mx-auto mt-8 flex w-full max-w-4xl flex-col md:flex-row md:space-x-8">
        <div className="flex-1 rounded-lg border p-6 shadow-lg">
          <h2 className="mb-4 text-center text-2xl font-bold">Create Team</h2>
          <form
            onSubmit={onCreateTeamSubmit}
            className="flex flex-col items-center justify-center gap-2 space-y-8"
          >
            <div className="flex flex-col items-center">
              <p className="pb-3">Pick a Team Name</p>
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {getTeamNames.data?.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      className={`rounded-lg px-4 py-2 backdrop-blur-xl ${
                        createTeamName === item.name
                          ? "border-green-500 bg-green-500/50"
                          : "border-white bg-white/50"
                      }`}
                      onClick={() => setCreateTeamName(item.name)}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="w-fit rounded-lg border bg-blue-500/50 px-4 py-2"
                  onClick={async () => await getTeamNames.refetch()}
                >
                  <RefreshCcw className="size-6" />
                </button>
              </div>
            </div>
            <Button disabled={isSubmitting} type="submit">
              Submit
            </Button>
          </form>
        </div>

        {/* Join Team Card */}
        <div className="mt-8 flex flex-1 flex-col items-center rounded-lg border p-6 shadow-lg md:mt-0">
          <form
            onSubmit={onJoinTeamSubmit}
            className="flex flex-col items-center justify-between space-y-8"
          >
            <h2 className="mb-4 text-center text-2xl font-bold">Join Team</h2>
            <div className="flex flex-col items-center">
              <label className="block pb-2">Team Id</label>
              <Input
                placeholder="Enter team Id"
                value={joinTeamId}
                onChange={getTeamDetailsHandler}
              />
              <p className="text-sm opacity-70">
                Get your Team ID from your leader
              </p>
            </div>
            {searchTeamId.length > 0 && (
              <div className="flex justify-center">
                <TeamList teamId={joinTeamId} />
              </div>
            )}
            <Button type="submit">Submit</Button>
          </form>
        </div>
      </div>
    </>
  );
}
