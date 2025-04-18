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
import { Check, ChevronsUpDown, Github } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Spinner from "../spinner";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

const GithubSheet = () => {
  const [teamId, setTeamId] = useState<string>("");
  const [userTeamId, setUserTeamId] = useState<string>("");
  const [teamQuery, setTeamQuery] = useState<string>("");
  const [userTeamQuery, setUserTeamQuery] = useState<string>("");
  const [teamDropdownOpen, setTeamDropdownOpen] = useState<boolean>(false);
  const [userTeamDropdownOpen, setUserTeamDropdownOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("all-teams");
  const [githubUsername, setGithubUsername] = useState<string>("");

  const { data: githubTeams } = api.github.getAllGithubTeams.useQuery();
  
  const {
    data: repoCount,
    refetch: refetchRepoCount,
    isLoading: repoCountLoading,
  } = api.github.getNumberOfRepos.useQuery({ teamId: teamId });

  // Mutations
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

  return (
    <Sheet>
      <SheetTrigger>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold">
          <Github className="mr-2 h-4 w-4" />
          GitHub Management
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full max-w-3xl overflow-y-auto bg-slate-950 p-0">
        <SheetHeader className="bg-slate-900 p-6 sticky top-0 z-10">
          <SheetTitle className="text-2xl font-bold text-white flex items-center">
            <Github className="h-6 w-6 mr-2" />
            GitHub Management
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            <Link
              href="https://github.com/hackfest-dev"
              target="_blank"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span className="font-mono">hackfest-dev</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </Link>
          </SheetDescription>
        </SheetHeader>
        
        <Tabs defaultValue="all-teams" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 max-w-md mx-auto my-4">
            <TabsTrigger value="all-teams">Global Actions</TabsTrigger>
            <TabsTrigger value="single-team">Single Team</TabsTrigger>
            <TabsTrigger value="user-actions">User Actions</TabsTrigger>
          </TabsList>
          
          {/* Initial Setup Tab */}
          <div className="px-6 py-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white">Initial Team Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 mb-3">
                  Create teams, initialize private repos, and send invitations to team members
                </p>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    toast.loading("Creating teams, repositories, sending invitations");
                    sendInvitation.mutate();
                  }}
                >
                  Initialize Teams & Send Invitations
                </Button>
              </CardContent>
            </Card>
            <Separator className="my-4 bg-slate-800" />
          </div>

          {/* All Teams Tab */}
          <TabsContent value="all-teams" className="px-6 pb-6">
            <Card className="bg-slate-900 border-slate-800 mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">Repository Visibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    className="bg-slate-800 hover:bg-slate-700" 
                    onClick={() => {
                      toast.loading("Making all teams' repo private");
                      makeRepoPrivateForAll.mutate();
                    }}
                  >
                    Make All Private
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      toast.loading("Making all teams' repo public");
                      makeRepoPublicForAll.mutate();
                    }}
                  >
                    Make All Public
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">Commit Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      toast.loading("Enabling commits for all teams");
                      enableCommitForAll.mutate();
                    }}
                  >
                    Enable All Commits
                  </Button>
                  <Button 
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      toast.loading("Disabling commits for all teams");
                      disableCommitForAll.mutate();
                    }}
                  >
                    Disable All Commits
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Single Team Tab */}
          <TabsContent value="single-team" className="px-6 pb-6">
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-300 mb-1 block">Select Team</label>
              <Popover open={teamDropdownOpen} onOpenChange={setTeamDropdownOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={teamDropdownOpen}
                    className="w-full justify-between border-slate-700 bg-slate-800 hover:bg-slate-700"
                  >
                    {teamQuery
                      ? githubTeams?.find((githubTeam) => githubTeam.team.name === teamQuery)?.team.name
                      : "Select Team"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 z-50">
                  <Command className="bg-slate-900 border border-slate-700">
                    <CommandInput placeholder="Search Team Name" className="border-b border-slate-700" />
                    <CommandEmpty>No team found</CommandEmpty>
                    <CommandGroup>
                      {githubTeams?.map((githubTeam) => (
                        <CommandItem
                          key={githubTeam.id}
                          value={githubTeam.team.name}
                          onSelect={async (currentValue) => {
                            setTeamQuery(currentValue === teamQuery ? "" : currentValue);
                            setTeamId(currentValue === teamQuery ? "" : githubTeam.teamId);
                            await refetchRepoCount();
                            setTeamDropdownOpen(false);
                          }}
                          className="hover:bg-slate-800"
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              teamQuery === githubTeam.team.name ? "opacity-100" : "opacity-0"
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

            {teamId ? (
              <>
                <div className="flex items-center justify-between mb-4 p-3 bg-slate-900 border border-slate-800 rounded-md">
                  <span className="text-slate-300">Repositories:</span>
                  <Badge variant="outline" className="border-slate-700 text-slate-300">
                    {!repoCountLoading ? repoCount : <Spinner size={"small"} />}
                  </Badge>
                </div>

                <div className="grid gap-4">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
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
                    Add Repository to Team
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Card className="bg-slate-900 border-slate-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-white">Repository Visibility</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          className="bg-slate-800 hover:bg-slate-700"
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
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            toast.loading("Making repo public for team");
                            makeRepoPublicForTeam.mutate({
                              teamId: teamId,
                            });
                          }}
                        >
                          Public
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-slate-900 border-slate-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-white">Commit Access</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
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
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => {
                            toast.loading("Disabling commits");
                            disableCommitForTeam.mutate({
                              teamId: teamId,
                            });
                          }}
                        >
                          Disable
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center p-8 text-slate-500">
                Please select a team to manage
              </div>
            )}
          </TabsContent>

          {/* User Actions Tab */}
          <TabsContent value="user-actions" className="px-6 pb-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">Team Invitation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">Select Team</label>
                  <Popover open={userTeamDropdownOpen} onOpenChange={setUserTeamDropdownOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={userTeamDropdownOpen}
                        className="w-full justify-between border-slate-700 bg-slate-800 hover:bg-slate-700"
                      >
                        {userTeamQuery
                          ? githubTeams?.find((githubTeam) => githubTeam.team.name === userTeamQuery)?.team.name
                          : "Select Team"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 z-50">
                      <Command className="bg-slate-900 border border-slate-700">
                        <CommandInput placeholder="Search Team Name" className="border-b border-slate-700" />
                        <CommandEmpty>No team found</CommandEmpty>
                        <CommandGroup>
                          {githubTeams?.map((githubTeam) => (
                            <CommandItem
                              key={githubTeam.id}
                              value={githubTeam.team.name}
                              onSelect={(currentValue) => {
                                setUserTeamQuery(currentValue === userTeamQuery ? "" : currentValue);
                                setUserTeamId(currentValue === userTeamQuery ? "" : githubTeam.teamId);
                                setUserTeamDropdownOpen(false);
                              }}
                              className="hover:bg-slate-800"
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  userTeamQuery === githubTeam.team.name ? "opacity-100" : "opacity-0"
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
                
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">GitHub Username</label>
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="Enter GitHub username"
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-white"
                  />
                </div>
                
                <Button
                  className={`w-full ${userTeamId && githubUsername ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-700'}`}
                  disabled={!userTeamId || !githubUsername}
                  onClick={() => {
                    toast.loading("Sending invitation to user");
                    sendInvitationToUser.mutate({
                      teamId: userTeamId,
                      githubUsername: githubUsername,
                    });
                  }}
                >
                  Send Team Invitation
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Video Section */}
          <div className="px-6 py-4 mt-2">
            <Separator className="mb-4 bg-slate-800" />
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white">Video Submission Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 mb-3">
                  Enable or disable video submission functionality
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button className="bg-green-600 hover:bg-green-700" disabled>
                    Enable Submissions
                  </Button>
                  <Button className="bg-red-600 hover:bg-red-700" disabled>
                    Disable Submissions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default GithubSheet;
