import { type inferRouterOutputs } from "@trpc/server";
import router from "next/router";
import React, { useEffect, useState } from "react";
import { type userRouter } from "~/server/api/routers/user";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

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

  const [teamMembers, setTeamMembers] = useState<{
    leader: User
    members: User[]
  } | null>(null);

  useEffect(() => {
    const leader = user?.team?.members.filter((member) => { return member.isLeader })
    const members = user?.team?.members.filter((member) => { return !member.isLeader}) ?? []

    if(leader && leader.length > 0){
        setTeamMembers({
            leader: leader[0] as User,
            members: members
        })
    }else{
        setTeamMembers({
            leader: { name: "User", image: "https://github.com/shadcn.png", isLeader: true},
            members: members
        })

    }
  },[user])

  return (
    <>
      <div className="flex h-full w-full flex-col gap-4 rounded-md border-2 p-2">
        <h1 className="text-xl">Team Details</h1>
        {user?.team ? (
          <div>
            <div className="flex w-full flex-nowrap items-center justify-between px-4">
              <h1 className="bg-gradient-to-b from-neutral-50 via-neutral-500 to-neutral-300 bg-clip-text text-2xl font-semibold text-transparent">
                {user.team.name}
              </h1>
              {user.team.isComplete ? (
                <Badge className="bg-green-800 p-2 py-1 text-white">
                  Complete
                </Badge>
              ) : (
                <Badge variant="destructive" className="p-2 py-1">
                  Incomplete
                </Badge>
              )}
            </div>
            <div>{teamMembers?.leader && <div>{teamMembers.leader.name}</div>}</div>
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
    <div
      className="flex h-full flex-col justify-center
             rounded-md bg-gradient-to-b from-red-500 via-red-600 to-red-400 p-4 text-center text-xl font-semibold text-black"
    >
      <p>You are not in any team</p>
      <div className="mt-4 flex justify-center gap-4">
        <Button
          onClick={async () => {
            await router.push("/register", {
              query: {
                t: "join",
              },
            });
          }}
        >
          Join Team
        </Button>
        <Button
          onClick={async () => {
            await router.push("/register", {
              query: {
                t: "create",
              },
            });
          }}
        >
          Create Team
        </Button>
      </div>
    </div>
  );
}
