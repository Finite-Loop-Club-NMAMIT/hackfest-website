import { type inferRouterOutputs } from "@trpc/server";
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
import { FaMoneyBill } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Building, MapPin } from "lucide-react"; // Import icons

interface User {
  name: string | null;
  image: string | null;
  isLeader: boolean;
}

interface TeamDetailsProps {
  user: inferRouterOutputs<typeof userRouter>["getUserDetails"];
  order: number;
  boysDormitory?: string | null;
  girlsDormitory?: string | null;
  arena?: string | null;
}

export default function TeamDetails({
  user,
  order,
  boysDormitory,
  girlsDormitory,
  arena,
}: TeamDetailsProps) {
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
              <h1 className="text-center text-2xl font-semibold">
                {user.Team.name}
              </h1>
              <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
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
            <PaymentButton />
            {/* --- Enhanced Allocation Details Styling --- */}
            {((boysDormitory ?? girlsDormitory) ?? arena) && (
              <div className="mt-5 rounded-lg border border-blue-400/30 bg-gradient-to-br from-blue-900/30 via-black/20 to-blue-900/30 p-4 shadow-md shadow-blue-500/10">
                <h4 className="mb-3 text-center text-lg font-bold tracking-wide text-blue-300">
                  Venue & Accommodation
                </h4>
                <div className="space-y-2 text-center text-sm text-gray-300">
                  {/* Display Boys Dormitory Name if available */}
                  {boysDormitory && (
                    <p className="flex items-center justify-center gap-2">
                      <Building size={16} className="text-blue-400" />
                      <span className="font-semibold text-gray-100">
                        Boys Dorm:
                      </span>{" "}
                      {boysDormitory}
                    </p>
                  )}
                  {/* Display Girls Dormitory Name if available */}
                  {girlsDormitory && (
                    <p className="flex items-center justify-center gap-2">
                      <Building size={16} className="text-pink-400" />
                      <span className="font-semibold text-gray-100">
                        Girls Dorm:
                      </span>{" "}
                      {girlsDormitory}
                    </p>
                  )}
                  {/* Display Arena Name if available */}
                  {arena && (
                    <p className="flex items-center justify-center gap-2">
                      <MapPin size={16} className="text-green-400" />
                      <span className="font-semibold text-gray-100">
                        Arena:
                      </span>{" "}
                      {arena}
                    </p>
                  )}
                </div>
              </div>
            )}
            {/* --- End of Enhanced Allocation Details Styling --- */}
            {settings.settings?.isRegistrationOpen ? (
              <>
                {user.profileProgress === "FORM_TEAM" ? (
                  <TeamSettings leader={user.isLeader} team={teamMembers} />
                ) : (
                  <div className="w-full py-4 text-center text-sm opacity-50 sm:text-base">
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

function PaymentButton() {
  const settings = useContext(settingsCtx);
  const session = useSession();
  const router = useRouter();

  if (settings.settings?.isTop60Validated) {
    if (session.data?.user.team?.teamProgress === "NOT_SELECTED" || session.data?.user.team?.teamProgress === "SEMI_SELECTED") {
      return (
        <Badge
          variant={"destructive"}
          className="mx-auto mt-6 w-fit text-center opacity-80"
        >
          Your team is not selected
        </Badge>
      );
    } else {
      if (settings.settings.isPaymentOpen) {
        if (session.data?.user.team?.paymentStatus === "PENDING") {
          return (
            <Button
              className="mx-auto mt-6 flex flex-row flex-nowrap gap-2"
              onClick={async () => {
                await router.push("/register");
              }}
            >
              <FaMoneyBill className="size-6" />
              Pay Registration Fee
            </Button>
          );
        } else {
          return (
            <Badge
              variant={"default"}
              className="mx-auto mt-6 w-fit bg-green-500 text-center opacity-80"
            >
              Payment{" "}
              {session.data?.user.team?.paymentStatus === "PAID"
                ? "success"
                : "requires verification"}
            </Badge>
          );
        }
      } else {
        if (
          session.data?.user.team?.paymentStatus === "PAID" ||
          session.data?.user.team?.paymentStatus === "VERIFY"
        ) {
          return (
            <Badge
              variant={"default"}
              className="mx-auto mt-6 w-fit bg-green-500 text-center opacity-80"
            >
              Payment{" "}
              {session.data.user.team.paymentStatus === "PAID"
                ? "success"
                : "requires verification"}
            </Badge>
          );
        } else {
          return (
            <Badge
              variant={"destructive"}
              className="mx-auto mt-6 w-fit text-center opacity-80"
            >
              Payment is closed
            </Badge>
          );
        }
      }
    }
  }
}
