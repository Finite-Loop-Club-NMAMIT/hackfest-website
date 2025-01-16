// create and join team tabs
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createTeamZ, joinTeamZ } from "~/server/schema/zod-schema";
import { useSearchParams } from "next/navigation";
import { inferRouterOutputs } from "@trpc/server";
import { teamRouter } from "~/server/api/routers/team";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { toast } from "sonner";
import gsap from "gsap";

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
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { RxCrossCircled } from "react-icons/rx";
import AnimatedAvatarGroup from "~/components/animatedAvatarGroup";

export default function RegisterTeamForm() {
  const params = useSearchParams();
  const router = useRouter();
  const utils = api.useUtils();

  const createTeamMutation = api.team.createTeam.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setIsTeamComplete("created");
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
      setIsTeamComplete("joined");
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
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [teamDetailsTimeout, setTeamDetailsTimeout] =
    useState<NodeJS.Timeout>();
  const [isTeamNameUnique, setIsTeamNameUnique] = useState<
    "loading" | "inuse" | "available" | "warning" | null
  >(null);
  const [isTeamComplete, setIsTeamComplete] = useState<
    "joined" | "created" | null
  >(null);
  const [teamDetails, setTeamDetails] = useState<
    inferRouterOutputs<typeof teamRouter>["checkTeamById"] | null
  >(null);

  function onCreateTeamSubmit(values: z.infer<typeof createTeamZ>) {
    createTeamMutation.mutate(values);
  }
  function onJoinTeamSubmit(values: z.infer<typeof joinTeamZ>) {
    joinTeamMutation.mutate(values);
  }

  function checkIsTeamNameUnique(event: React.ChangeEvent<HTMLInputElement>) {
    const teamName = event.currentTarget.value;
    const length = createTeamForm.getValues("teamName").length;
    const isSpecialChar = /[^a-zA-Z0-9]/.test(
      createTeamForm.getValues("teamName"),
    );

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

    if (value && value.length > 0) {
      if (teamDetailsTimeout) {
        clearTimeout(teamDetailsTimeout);
      }
      const timeout = setTimeout(() => {
        void utils.team.checkTeamById
          .fetch({ teamId: value })
          .then((response) => {
            if (response?.team) {
              console.log(response);

              setTeamDetails(response);
            } else {
              setTeamDetails(null);
            }
          })
          .catch((error) => {
            setTeamDetails(null);
          });
      }, 500);

      setTeamDetailsTimeout(timeout);
    } else {
      if (teamDetailsTimeout) {
        clearTimeout(teamDetailsTimeout);
      }
    }
  }
  // return <div>
  //   You have successfully joined the team
  // </div>

  if (isTeamComplete === "joined") {
    return "joined";
  } else if (isTeamComplete === "created") {
    return "created";
  } else
    return (
      <>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
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
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter team name"
                          {...field}
                          onInput={checkIsTeamNameUnique}
                        />
                      </FormControl>
                      {isTeamNameUnique === "loading" && (
                        <div className="flex flex-row items-center gap-2 opacity-60">
                          <span className="loader size-4 text-[1px]"></span>{" "}
                          <p>Checking for team name availability</p>
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
                          <p>You can use this team name</p>
                        </div>
                      )}
                      {isTeamNameUnique === "warning" && (
                        <div className="flex flex-row items-center gap-1 text-red-500 opacity-60">
                          <RxCrossCircled />
                          <p>
                            Team should be less than 10 characters and no
                            special symbols
                          </p>
                        </div>
                      )}
                      {isTeamNameUnique === "inuse" && (
                        <div className="flex flex-row items-center gap-1 text-red-500 opacity-60">
                          <RxCrossCircled />
                          <p>Team name already in use</p>
                        </div>
                      )}

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  onClick={async (e) => {
                    e.preventDefault();
                    if (isTeamNameUnique === "available") {
                      await createTeamForm.handleSubmit(onCreateTeamSubmit)();
                    } else {
                      if (isTeamNameUnique === "inuse") {
                        toast.warning("Team name is already in use");
                      } else if (isTeamNameUnique === "warning") {
                        toast.warning("Team name not valid");
                      }
                    }
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
                      <FormDescription>
                        You can get the team id from the team leader
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="max-w-4xl rounded-md border-2 border-black/30 bg-[#05153d] p-4">
                  {/* <h1 className="">Team Details</h1> */}
                  <div className="grid grid-cols-3">
                    <h1 className="text-xl font-bold">
                      {teamDetails?.team?.name}
                    </h1>
                    <h1 className="text-md font-semibold">
                      {
                        teamDetails?.team?.members.find(
                          (member) => member.isLeader,
                        )?.name
                      }
                    </h1>
                    <div>
                      {/* {teamDetails?.team?.members.map((member) => )} */}
                      {teamDetails?.team?.members.length && (
                        <AnimatedAvatarGroup
                          users={teamDetails?.team?.members}
                        />
                      )}
                    </div>
                  </div>
                </div>
                {teamDetails && <div>{JSON.stringify(teamDetails)}</div>}
                <Button type="submit">Submit</Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </>
    );
}
