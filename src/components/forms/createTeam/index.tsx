// create and join team tabs
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { createTeamZ, joinTeamZ } from "~/server/schema/zod-schema";
import { useSearchParams } from "next/navigation";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { toast } from "sonner";
import gsap from "gsap";
import { useSession } from "next-auth/react";
import { Team } from "@prisma/client";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { RxCrossCircled } from "react-icons/rx";
import { ClipboardCopy } from "lucide-react";
import TeamList from "~/components/team/teamList";

export default function RegisterTeamForm() {
  const { update } = useSession();
  const params = useSearchParams();
  const router = useRouter();
  const utils = api.useUtils();

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
      toast.success(data.message);
      gsap.set("#form.title", { innerText: "Team Joined" });
      const timeout = setTimeout(() => {
        void router.push("/profile");
      }, 5000);

      return () => clearTimeout(timeout);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createTeamForm = useForm<z.infer<typeof createTeamZ>>({
    resolver: zodResolver(createTeamZ),
    defaultValues: {
      teamName: "",
    },
  });
  const joinTeamForm = useForm<z.infer<typeof joinTeamZ>>({
    resolver: zodResolver(joinTeamZ),
    defaultValues: {
      teamId: "",
    },
  });

  const [teamTimeout, setTeamTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamDetailsTimeout, setTeamDetailsTimeout] =
    useState<NodeJS.Timeout>();
  const [isTeamNameUnique, setIsTeamNameUnique] = useState<
    "loading" | "inuse" | "available" | "warning" | null
  >(null);
  const [teamDetails, setTeamDetails] = useState<Team | null>(null);
  const [searchTeamId, setSearchTeamId] = useState<string>("");

  function onCreateTeamSubmit(values: z.infer<typeof createTeamZ>) {
    createTeamMutation.mutate(values);
  }
  function onJoinTeamSubmit(values: z.infer<typeof joinTeamZ>) {
    joinTeamMutation.mutate(values);
  }

  function checkIsTeamNameUnique(event: React.ChangeEvent<HTMLInputElement>) {
    const teamName = event.currentTarget.value;
    const length = createTeamForm.getValues("teamName").length;
    const isSpecialChar = /[^a-zA-Z0-9]/.test(teamName);

    if (length > 10 || isSpecialChar) {
      setIsTeamNameUnique("warning");
      if (teamTimeout) {
        clearTimeout(teamTimeout);
      }
      return;
    }

    if (teamName.length > 0) {
      setIsTeamNameUnique("loading");
      if (teamTimeout) {
        clearTimeout(teamTimeout);
      }

      if (teamName.length > 10) {
        setIsTeamNameUnique("warning");
        return;
      }

      const timeout = setTimeout(() => {
        void utils.team.checkName
          .fetch({ teamName: teamName })
          .then((response) => {
            setIsTeamNameUnique(response.message ? "available" : "inuse");
          })
          .catch((error) => {
            console.log(error.message);
          });
      }, 500);

      setTeamTimeout(timeout);
    } else {
      setIsTeamNameUnique(null);
      if (teamTimeout) {
        clearTimeout(teamTimeout);
      }
    }
  }

  function getTeamDetails(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.currentTarget.value;

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
              <p>
                Your team,{" "}
                <span className="font-extrabold">
                  {teamDetails?.name ?? "New Team"}
                </span>
                , has been created successfully. Use the code below to invite
                your fellow members.
              </p>
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
                  value={
                    teamDetails?.id ??
                    "code not availablecode not availablecode not availablecode not availablecode not availablecode not availablecode not available"
                  }
                  className="cursor-pointer truncate pr-10 text-left"
                  readOnly
                />
                <ClipboardCopy className="absolute right-1 top-1 size-8 rounded-r-md p-1" />
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Tabs
        defaultValue={params.get("t") ?? "create"}
        onValueChange={async (value) => {
          await router.push("/register", { query: { t: value } });
        }}
        className="mx-auto flex w-full max-w-3xl flex-col justify-center"
      >
        <TabsList className="mx-auto mt-8 w-full max-w-lg">
          <TabsTrigger value="create" className="w-full">
            Create
          </TabsTrigger>
          <TabsTrigger value="join" className="w-full">
            Join
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-4">
          <Form {...createTeamForm}>
            <form
              onSubmit={createTeamForm.handleSubmit(onCreateTeamSubmit)}
              className="space-y-8"
            >
              <FormField
                control={createTeamForm.control}
                name="teamName"
                render={({ field }) => (
                  <FormItem className="min-h-24">
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter team name"
                        {...field}
                        onInput={checkIsTeamNameUnique}
                      />
                    </FormControl>
                    <div className="left-2 text-xs md:text-sm">
                      {isTeamNameUnique === "loading" && (
                        <div className="flex flex-row items-center gap-2 opacity-60">
                          <span className="loader size-4 text-[1px]"></span>{" "}
                          <p>Checking availability</p>
                        </div>
                      )}
                      {isTeamNameUnique === "available" && (
                        <div className="flex flex-row items-center gap-1 text-green-500 opacity-60">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            className="lucide lucide-circle-check size-4"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                          <p>Available</p>
                        </div>
                      )}
                      {isTeamNameUnique === "warning" && (
                        <div className="flex flex-row items-center gap-1 text-red-500 opacity-60">
                          <RxCrossCircled className="size-6" />
                          <p>
                            Length must be less than 10 and no special symbols
                          </p>
                        </div>
                      )}
                      {isTeamNameUnique === "inuse" && (
                        <div className="flex flex-row items-center gap-1 text-red-500 opacity-60">
                          <RxCrossCircled className="" />
                          <p>Team name already in use</p>
                        </div>
                      )}
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                disabled={isSubmitting}
                onClick={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  if (isTeamNameUnique === "available") {
                    await createTeamForm.handleSubmit(onCreateTeamSubmit)();
                  } else {
                    if (isTeamNameUnique === "inuse") {
                      toast.warning("Team name is already in use");
                    } else if (isTeamNameUnique === "warning") {
                      toast.warning("Team name not valid");
                    }
                  }
                  setIsSubmitting(false);
                }}
              >
                Submit
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="join" className="mt-4">
          <Form {...joinTeamForm}>
            <form
              onSubmit={joinTeamForm.handleSubmit(onJoinTeamSubmit)}
              className="space-y-8"
            >
              <FormField
                control={joinTeamForm.control}
                name="teamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Id</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter team Id"
                        {...field}
                        onInput={getTeamDetails}
                      />
                    </FormControl>
                    <FormDescription className="text-sm">
                      Get your Team ID from your leader
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {searchTeamId.length > 0 && (
                <div className="flex justify-center">
                  <TeamList teamId={joinTeamForm.getValues("teamId")} />
                </div>
              )}

              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </>
  );
}
