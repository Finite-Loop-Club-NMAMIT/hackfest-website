import { type inferRouterOutputs } from "@trpc/server";
import router, { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { type userRouter } from "~/server/api/routers/user";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { context as settingsCtx } from "../appSettingValidator";

import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import TeamList from "../team/teamList";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import Link from "next/link";
import Image from "next/image";
import { Copy } from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";

interface User {
  name: string | null;
  image: string | null;
  isLeader: boolean;
}

export default function TeamDetails({
  user,
  order,
}: {
  user: inferRouterOutputs<typeof userRouter>["getUserDetails"];
  order: number;
}) {
  const settings = useContext(settingsCtx);
  const [teamMembers, setTeamMembers] = useState<{
    leader: User;
    members: User[];
  } | null>(null);

  useEffect(() => {
    const leader = user?.Team?.Members.filter((member) => {
      return member.isLeader;
    });
    const members =
      user?.Team?.Members.filter((member) => {
        return !member.isLeader;
      }) ?? [];

    if (leader && leader.length > 0) {
      setTeamMembers({
        leader: leader[0] as User,
        members: members,
      });
    } else {
      setTeamMembers({
        leader: {
          name: "User",
          image: "https://github.com/shadcn.png",
          isLeader: true,
        },
        members: members,
      });
    }
  }, [user]);

  return (
    <>
      <div
        className="flex h-full w-full flex-col gap-4 rounded-md border-2 p-2"
        style={{ order: order }}
      >
        <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
          <h1 className="text-xl">Team Details</h1>
          {user?.Team ? (
            teamMembers?.members &&
            teamMembers.leader &&
            teamMembers?.members.length >= 2 &&
            teamMembers?.members.length <= 3 ? (
              user?.profileProgress === "FORM_TEAM" ? (
                <Badge className="bg-yellow-600 p-2 py-1 hover:bg-yellow-700">
                  Pending
                </Badge>
              ) : (
                <Badge className="bg-green-800 p-2 py-1 text-white hover:bg-green-700">
                  Complete
                </Badge>
              )
            ) : (
              <Badge variant="destructive" className="p-2 py-1">
                {3 - (teamMembers?.members?.length ?? 0)}-
                {4 - (teamMembers?.members?.length ?? 0)} more members needed
              </Badge>
            )
          ) : (
            <></>
          )}
        </div>
        {user?.Team ? (
          <div className="flex h-full w-full flex-col">
            <div className="flex w-full flex-col items-center justify-center gap-2 px-4">
              <Image
                src={`https://res.cloudinary.com/dmopbpn6f/image/upload/v1741114693/TeamImages/${user.Team.name.replace(" ", "_")}.webp`}
                width={100}
                height={100}
                alt="Team Image"
                className="rounded-full"
              />
              <h1 className="text-2xl font-semibold">{user.Team.name}</h1>
              <div className="flex items-center justify-center gap-2">
                <button
                  className="flex items-center justify-center gap-2 rounded-full border border-white bg-white/50 px-4 py-2 text-xs font-semibold text-white backdrop-blur-2xl duration-300 hover:scale-105 hover:bg-white/70"
                  onClick={async () => {
                    if (typeof window !== "undefined") {
                      await window.navigator.clipboard.writeText(
                        user.Team?.id ?? "",
                      );
                      toast.info("Code copied successfully!");
                    }
                  }}
                >
                  <Copy size={15} />
                  <span>Copy Team ID</span>
                </button>
                <a
                  className="flex items-center justify-center gap-2 rounded-full border border-green-500 bg-green-500/50 px-4 py-2 text-xs font-semibold text-green-500 backdrop-blur-2xl duration-300 hover:scale-105 hover:bg-green-500/70"
                  href={`https://wa.me/?text=${encodeURIComponent(`Join my team ${user.Team.name} for Hackfest '25. https://hackfest.dev/register?teamId=${user.Team.id}`)}`}
                  target="_blank"
                >
                  <BsWhatsapp />
                  Share on WhatsApp
                </a>
              </div>
            </div>
            <div className="flex h-full flex-col items-center justify-between">
              <TeamList teamId={user.Team.id} showTeamName={false} />
            </div>
            {settings.settings?.isRegistrationOpen ? (
              <>
                {user.profileProgress === "FORM_TEAM" ? (
                  <TeamSettings leader={user.isLeader} team={teamMembers} />
                ) : (
                  <div className="w-full py-4 text-center opacity-50">
                    Your team has registered
                  </div>
                )}
              </>
            ) : (
              <div className="w-full py-4 text-center opacity-50">
                Team registrations are closed
              </div>
            )}
          </div>
        ) : (
          <NotInTeam />
        )}
      </div>
    </>
  );
}

function NotInTeam() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center rounded-md text-center text-xl font-semibold text-black">
      <div className="absolute left-0 top-0 z-10 h-full w-full bg-gradient-to-r from-transparent via-red-700/80 to-transparent"></div>
      <div className="absolute left-0 top-0 z-0 h-full w-full bg-gradient-to-b from-[#132c5a]/80 via-transparent to-[#132c5a]/80"></div>
      <div className="z-20 flex h-full w-full flex-col justify-center bg-transparent p-4 backdrop-blur-xl">
        <p className="text-base text-white md:text-lg">
          You are not in any team
        </p>
        <div className="mt-4 flex w-full justify-center gap-4">
          <Link href="/register">
            <Button className="text-xs md:text-sm">
              Create or Join a team
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function TeamSettings({
  leader,
  team,
}: {
  leader: boolean;
  team: {
    leader: User;
    members: User[];
  } | null;
}) {
  const router = useRouter();

  const deleteTeamMutaion = api.team.deleteTeam.useMutation({
    onSuccess: () => {
      toast.success("Team deleted successfully");
      router.reload();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const updateProfileMutation = api.user.updateProfileProgress.useMutation({
    onSuccess: () => {
      toast.success("Team registered successfully");
      router.reload();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const leaveTeamMutation = api.team.leaveTeam.useMutation({
    onSuccess: () => {
      toast.success("Team left successfully");
      router.reload();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (leader) {
    return (
      <div className="mt-4 flex justify-center gap-4">
        {/* Delete */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                team and you should re-register.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>No</Button>
              </DialogClose>
              <Button
                onClick={() => {
                  deleteTeamMutaion.mutate();
                }}
                variant="destructive"
              >
                Yes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Register */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>Register</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                You team will be registered and will be able to submit idea. If
                a member leaves, then the team get unregistered.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="destructive">No</Button>
              </DialogClose>
              <Button
                onClick={() => {
                  if (
                    team?.leader &&
                    team?.members &&
                    (team.members.length < 2 || team.members.length > 3)
                  ) {
                    toast.warning("Team requirements not met");
                  } else {
                    updateProfileMutation.mutate();
                  }
                }}
              >
                Yes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  } else {
    return (
      <div className="mt-4 flex justify-center">
        {/* Leave */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">Leave</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. You will be removed from the team.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>No</Button>
              </DialogClose>
              <Button
                onClick={() => {
                  leaveTeamMutation.mutate();
                }}
                variant="destructive"
              >
                Yes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}
