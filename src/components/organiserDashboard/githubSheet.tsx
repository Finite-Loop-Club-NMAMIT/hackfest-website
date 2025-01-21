import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import Link from "next/link";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Input } from "../ui/input";
import Spinner from "../spinner";
import { RxDash } from "react-icons/rx";

const GithubSheet = () => {
  const [teamId, setTeamId] = useState<string>("");
  const [userTeamId, setUserTeamId] = useState<string>("");
  const [teamQuery, setTeamQuery] = useState<string>("");
  const [userTeamQuery, setUserTeamQuery] = useState<string>("");
  const [teamDropdownOpen, setTeamDropdownOpen] = useState<boolean>(false);
  const [userTeamDropdownOpen, setUserTeamDropdownOpen] =
    useState<boolean>(false);
  const [githubUsername, setGithubUsername] = useState<string>("");

  const { data: githubTeams } = api.github.getAllGithubTeams.useQuery();

  const {
    data: repoCount,
    refetch: refetchRepoCount,
    isLoading: repoCountLoading,
  } = api.github.getNumberOfRepos.useQuery({ teamId: teamId });

  const sendInvitation = api.github.sendInvitation.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("Successfully created teams, repos, and sent invitations");
    },
    onError: ({ message }) => {
      toast.dismiss();
      toast.error(message);
    },
  });

  const sendInvitationToUser = api.github.sendInvitationToUser.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("Successfully sent invitation to user");
    },
    onError: ({ message }) => {
      toast.dismiss();
      toast.error(message);
    },
  });

  const enableCommitForTeam = api.github.enableCommitForTeam.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("Successfully enabling commits");
    },
    onError: ({ message }) => {
      toast.dismiss();
      toast.error(message);
    },
  });

  const disableCommitForTeam = api.github.disableCommitForTeam.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("Successfully disabled commit for team");
    },
    onError: ({ message }) => {
      toast.dismiss();
      toast.error(message);
    },
  });

  const makeRepoPrivateForAll = api.github.makeRepoPrivateForAll.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("Successfully made repo private");
    },
    onError: ({ message }) => {
      toast.dismiss();
      toast.error(message);
    },
  });

  const makeRepoPublicForAll = api.github.makeRepoPublicForAll.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("Successfully made repo public");
    },
    onError: ({ message }) => {
      toast.dismiss();
      toast.error(message);
    },
  });

  const enableCommitForAll = api.github.enableCommitForAll.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("Successfully enabled commits");
    },
    onError: ({ message }) => {
      toast.dismiss();
      toast.error(message);
    },
  });

  const disableCommitForAll = api.github.disableCommitForAll.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("Successfully disabled commits");
    },
    onError: ({ message }) => {
      toast.dismiss();
      toast.error(message);
    },
  });

  const makeRepoPrivateForTeam = api.github.makeRepoPrivateForTeam.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("Successfully made repo private for team");
    },
    onError: ({ message }) => {
      toast.dismiss();
      toast.error(message);
    },
  });

  const makeRepoPublicForTeam = api.github.makeRepoPublicForTeam.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("Successfully made repo public for team");
    },
    onError: ({ message }) => {
      toast.dismiss();
      toast.error(message);
    },
  });

  const addRepoToTeam = api.github.addRepoToTeam.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("Added repo to team");
    },
    onError: ({ message }) => {
      toast.dismiss();
      toast.error(message);
    },
  });

  const enableVideoSubmission = api.video.enableVideoSubmission.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("Enabled video submission");
    },

    onError: ({ message }) => {
      toast.dismiss();
      toast.error(message);
    },
  });

  const disableVideoSubmission = api.video.disableVideoSubmission.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("Disabled video submission");
    },

    onError: ({ message }) => {
      toast.dismiss();
      toast.error(message);
    },
  });

  return (
    <Sheet>
      <SheetTrigger>
        <Button className="font-semibold">Github & Video</Button>
      </SheetTrigger>
      <SheetContent className="dark overflow-scroll bg-slate-950">
        <SheetHeader>
          <SheetTitle className="text-2xl text-white">
            Github Related Actions
          </SheetTitle>
          <SheetDescription className="flex flex-col items-center justify-center gap-3">
            <h1 className="text-lg font-semibold">
              Organization Name :{" "}
              <Link
                href={"https://github.com/hackfest-dev"}
                target="_blank"
                className="font-mono text-blue-400 underline"
              >
                Hackfest
              </Link>
            </h1>
            <div className="flex w-full flex-col items-center justify-center gap-3 rounded-sm border p-3">
              <h3 className="text-xl font-bold text-white">
                Creation & Invitation
              </h3>
              <Button
                onClick={() => {
                  toast.loading(
                    "Creating teams, repositories, sending invitations",
                  );
                  sendInvitation.mutate();
                }}
              >
                Send invitations
              </Button>
              <h3 className="px-3 font-semibold leading-snug">
                Create teams, create private repo and assign team, send
                invitation to members of team to join github team
              </h3>
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-3 rounded-sm border p-3 md:gap-5">
              <h3 className="text-xl font-bold text-white">Actions for all</h3>
              <div className="grid grid-cols-2 grid-rows-4 items-center justify-center gap-1 px-3 md:grid-cols-3 md:grid-rows-2 md:gap-3">
                <h3 className="col-span-2 font-semibold md:col-span-1">
                  Commits
                </h3>
                <Button
                  onClick={() => {
                    toast.loading("Enabling commits for all teams");
                    enableCommitForAll.mutate();
                  }}
                >
                  Enable
                </Button>
                <Button
                  onClick={() => {
                    toast.loading("Disabling commits for all teams");
                    disableCommitForAll.mutate();
                  }}
                >
                  Disable
                </Button>
                <h3 className="col-span-2 font-semibold md:col-span-1">
                  Repo Visibility
                </h3>
                <Button
                  onClick={() => {
                    toast.loading("Making all teams' repo private");
                    makeRepoPrivateForAll.mutate();
                  }}
                >
                  Private
                </Button>
                <Button
                  onClick={() => {
                    toast.loading("Making all teams' repo public");
                    makeRepoPublicForAll.mutate();
                  }}
                >
                  Public
                </Button>
              </div>
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-3 rounded-sm border p-3 md:gap-5">
              <h3 className="text-xl font-bold text-white">
                Actions for particular team
              </h3>
              <div className="grid grid-cols-2 grid-rows-6 items-center justify-center gap-1 px-3 md:grid-cols-3 md:grid-rows-4 md:gap-3">
                <div className="col-span-2 flex items-center justify-center md:col-span-3">
                  <Popover
                    open={teamDropdownOpen}
                    onOpenChange={setTeamDropdownOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={teamDropdownOpen}
                        className="w-[200px] justify-between"
                      >
                        {teamQuery
                          ? githubTeams?.find(
                              (githubTeam) =>
                                githubTeam.team.name === teamQuery,
                            )?.team.name
                          : "Select Team"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search Team Name" />
                        <CommandEmpty>No team found</CommandEmpty>
                        <CommandGroup>
                          {githubTeams?.map((githubTeam) => (
                            <CommandItem
                              key={githubTeam.id}
                              value={githubTeam.team.name}
                              onSelect={async (currentValue) => {
                                setTeamQuery(
                                  currentValue === teamQuery
                                    ? ""
                                    : currentValue,
                                );
                                setTeamId(
                                  currentValue === teamQuery
                                    ? ""
                                    : githubTeam.teamId,
                                );
                                await refetchRepoCount();
                                setTeamDropdownOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  teamQuery === githubTeam.team.name
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              {githubTeam.team.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>Repo Count</div>
                <div>
                  {teamId ? (
                    !repoCountLoading ? (
                      repoCount
                    ) : (
                      <Spinner size={"small"} />
                    )
                  ) : (
                    <RxDash />
                  )}
                </div>
                <Button
                  className="col-span-2 md:col-span-1"
                  onClick={() => {
                    if (repoCountLoading) {
                      toast.warning("Please wait till repo count is displayed");
                    } else {
                      toast.loading("Adding new repo to team");
                      addRepoToTeam.mutate({
                        teamId: teamId,
                      });
                    }
                  }}
                >
                  Add Repo
                </Button>
                <h3 className="col-span-2 font-semibold md:col-span-1">
                  Commits
                </h3>
                <Button
                  onClick={() => {
                    toast.loading("Enabling commits");
                    enableCommitForTeam.mutate({
                      teamId: teamId,
                    });
                  }}
                >
                  Enable
                </Button>
                <Button
                  onClick={() => {
                    toast.loading("Disabling commits");
                    disableCommitForTeam.mutate({
                      teamId: teamId,
                    });
                  }}
                >
                  Disable
                </Button>
                <h3 className="col-span-2 font-semibold md:col-span-1">
                  Repo Visibility
                </h3>
                <Button
                  onClick={() => {
                    toast.loading("Making repo private for team");
                    makeRepoPrivateForTeam.mutate({
                      teamId: teamId,
                    });
                  }}
                >
                  Private
                </Button>
                <Button
                  onClick={() => {
                    toast.loading("Making repo public for team");
                    makeRepoPublicForTeam.mutate({
                      teamId: teamId,
                    });
                  }}
                >
                  Public
                </Button>
              </div>
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-3 rounded-sm border p-3 md:gap-5">
              <h3 className="text-xl font-bold text-white">
                Actions for particular user
              </h3>
              <div className="grid grid-cols-1 grid-rows-3 items-center justify-center gap-3 px-3">
                <Popover
                  open={userTeamDropdownOpen}
                  onOpenChange={setUserTeamDropdownOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={userTeamDropdownOpen}
                      className="w-[200px] justify-between"
                    >
                      {userTeamQuery
                        ? githubTeams?.find(
                            (githubTeam) =>
                              githubTeam.team.name === userTeamQuery,
                          )?.team.name
                        : "Select Team"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search Team Name" />
                      <CommandEmpty>No team found</CommandEmpty>
                      <CommandGroup>
                        {githubTeams?.map((githubTeam) => (
                          <CommandItem
                            key={githubTeam.id}
                            value={githubTeam.team.name}
                            onSelect={(currentValue) => {
                              setUserTeamQuery(
                                currentValue === userTeamQuery
                                  ? ""
                                  : currentValue,
                              );
                              setUserTeamId(
                                currentValue === userTeamQuery
                                  ? ""
                                  : githubTeam.teamId,
                              );
                              setUserTeamDropdownOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                teamQuery === githubTeam.team.name
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            {githubTeam.team.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Input
                  placeholder="Github Username"
                  value={githubUsername}
                  onChange={(e) => {
                    setGithubUsername(() => {
                      return e.target.value;
                    });
                  }}
                />
                <Button
                  onClick={() => {
                    toast.loading("Sending invitation to user");
                    sendInvitationToUser.mutate({
                      teamId: userTeamId,
                      githubUsername: githubUsername,
                    });
                  }}
                >
                  Send Invitation
                </Button>
              </div>
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-3 rounded-sm border p-3">
              <h3 className="text-xl font-bold text-white">Video Submission</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Button
                  onClick={() => {
                    toast.loading("Enabling video submission");
                    enableVideoSubmission.mutate();
                  }}
                >
                  Enable Submission
                </Button>
                <Button
                  onClick={() => {
                    toast.loading("Disabling video submission");
                    disableVideoSubmission.mutate();
                  }}
                >
                  Disable Submission
                </Button>
              </div>
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default GithubSheet;
