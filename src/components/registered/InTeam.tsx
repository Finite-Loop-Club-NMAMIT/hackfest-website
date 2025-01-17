import React, { useEffect, useState } from "react";

import TeamList from "../team/teamList";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Info } from "lucide-react";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { FiAlertTriangle } from "react-icons/fi";

const MAX_SIZE = 4;
const MIN_SIZE = 3;

export default function InTeam({ isLeader }: { isLeader: boolean }) {
  const router = useRouter();
  const session = useSession();

  const teamSize = api.team.getTeamSize.useQuery();
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

  return (
    <div className="flex w-full max-w-4xl flex-col items-center justify-center rounded-md bg-black/50 p-4">
      <h1 className="gradient-text text-2xl font-bold md:text-4xl">
        Team Details
      </h1>
      {!teamSize.isLoading &&
      teamSize.data &&
      teamSize.data?.teamsize >= MIN_SIZE &&
      teamSize.data?.teamsize <= MAX_SIZE ? (
        <div className="md:text-md mt-8 flex flex-row flex-nowrap items-center justify-center gap-2 rounded-md bg-red-600/40 p-2 text-sm text-white">
          <Info />
          Team not yet registered!
        </div>
      ) : (
        <div className="md:text-md mt-8 flex flex-row flex-nowrap items-center justify-center gap-2 rounded-md bg-yellow-300/60 p-2 text-sm text-black">
          <FiAlertTriangle className="size-6" />
          Team size requirements not met!
        </div>
      )}
      {session.data?.user.team?.id && <TeamList teamId={session.data.user.team.id} />}
      {!isLeader && (
        <p className="mt-4 opacity-50">
          Ask your <span className="font-bold">leader</span> to delete or
          register your team
        </p>
      )}
      <div
        className={`mt-4 flex flex-nowrap gap-4 ${!isLeader ? "hidden" : "flex"}`}
      >
        {/* DELETE */}
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
                  updateProfileMutation.mutate();
                }}
              >
                Yes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
