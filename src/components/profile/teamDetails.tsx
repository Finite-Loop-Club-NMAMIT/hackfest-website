import { type inferRouterOutputs } from "@trpc/server";
import router, { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { type userRouter } from "~/server/api/routers/user";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

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

interface User {
  name: string | null;
  image: string | null;
  isLeader: boolean;
}

export default function TeamDetails({
  user,
}: {
  user: inferRouterOutputs<typeof userRouter>["getUserDetails"];
}) {
  const router = useRouter();
  const session = useSession();

  const deleteTeamMutaion = api.team.deleteTeam.useMutation({
    onSuccess: () => {
      toast.success("Team deleted successfully");
      const timeout = setTimeout(() => {
        void router.push("/profile");
        void session.update();
      }, 2000);

      return () => clearTimeout(timeout);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const updateProfileMutation = api.user.updateProfileProgress.useMutation({
    onSuccess: () => {
      toast.success("Team registered successfully");
      const timeout = setTimeout(() => {
        void router.push("/profile");
        void session.update();
      });

      return () => clearTimeout(timeout);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

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
      <div className="flex h-full w-full flex-col gap-4 rounded-md border-2 p-2">
        <h1 className="text-xl">Team Details</h1>
        {user?.Team ? (
          <div className="flex h-full w-full flex-col">
            <div className="flex w-full flex-nowrap items-center justify-between px-4">
              <h1 className="text-2xl font-semibold">{user.Team.name}</h1>
              {teamMembers?.members &&
              teamMembers?.members.length >= 3 &&
              teamMembers?.members.length <= 4 ? (
                user.Team.isComplete ? (
                  <Badge className="bg-green-800 p-2 py-1 text-white">
                    Complete
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-600 p-2 py-1">Pending</Badge>
                )
              ) : (
                <Badge variant="destructive" className="p-2 py-1">
                  Incomplete
                </Badge>
              )}
            </div>

            <div className="flex h-full flex-col items-center justify-between">
              <TeamList teamId={user.Team.id} showTeamName={false} />
              <div
                className={`${!session.data?.user.isLeader && "hidden"} mt-4 flex justify-center gap-4`}
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Delete</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete your team and you should re-register.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="destructive">No</Button>
                      </DialogClose>
                      <Button
                        onClick={() => {
                          deleteTeamMutaion.mutate();
                        }}
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
                        You team will be registered and will be able to submit
                        idea. If a member leaves, then the team get
                        unregistered.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="destructive">No</Button>
                      </DialogClose>
                      <Button
                        onClick={() => {
                          if (
                            teamMembers?.leader &&
                            teamMembers?.members &&
                            (teamMembers.members.length < 2 ||
                              teamMembers.members.length > 3)
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
            </div>
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
        <p className="text-white">You are not in any team</p>
        <div className="mt-4 flex flex-row-reverse justify-center gap-4">
          <Button
            onClick={async () => {
              await router.push("/register?t=join");
            }}
          >
            Join Team
          </Button>
          <Button
            onClick={async () => {
              await router.push("/register?t=create");
            }}
          >
            Create Team
          </Button>
        </div>
      </div>
    </div>
  );
}
