import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa6";
import { api } from "~/utils/api";

interface Member {
  id: string;
  name?: string;
  image?: string;
  github?: string;
  isLeader: boolean;
}

export default function TeamList({
  teamId,
  showTeamName,
}: {
  teamId: string;
  showTeamName?: boolean;
}) {
  const teamDetails = api.team.getTeamDetailsById.useQuery({ teamId: teamId });
  const [leader, setLeader] = useState<Member | null>(null);

  useEffect(() => {
    const members = teamDetails.data?.Members;
    let temp;

    if (members && members.length > 0) {
      temp = members.filter((member) => {
        if (member.isLeader) {
          return member;
        }
      });
    }

    temp && temp.length > 0 ? setLeader(temp[0] as Member) : setLeader(null);
  }, [teamDetails.data]);

  if (teamDetails.isLoading) {
    return <div className="text-white/50">Fetching Details...</div>;
  } else if (leader) {
    return (
      <div className="flex w-full flex-col items-center justify-center">
        {showTeamName && (
          <div className="text-2xl font-bold">{teamDetails.data?.name}</div>
        )}
        <div className="mt-4 flex w-full max-w-md flex-col gap-1 bg-blue-500/10">
          <div className="flex w-full flex-row flex-nowrap items-center gap-4 rounded-md border-2 p-1 px-2">
            <Image
              className="size-10 rounded-full border-4 border-yellow-500"
              src={leader?.image ?? "https://github.com/shadcn.png"}
              alt="leader"
              width={100}
              height={100}
            />
            <h1 className=" w-full text-ellipsis text-sm">
              {leader?.name ?? "leader"}
            </h1>
            <Link
              className="opacity-50"
              href={leader?.github ?? "github.com"}
              target="_blank"
            >
              <FaGithub className="size-6" />
            </Link>
          </div>
          {teamDetails.data?.Members.map((member, idx) => {
            if (!member.isLeader) {
              return (
                <div
                  className="flex w-full flex-row flex-nowrap items-center gap-4 rounded-md border-2 p-1 px-2"
                  key={idx}
                >
                  <Image
                    className="size-10 rounded-full border-4 border-white"
                    src={member.image ?? "https://github.com/shadcn.png"}
                    alt="leader"
                    width={100}
                    height={100}
                  />
                  <h1 className=" w-full text-ellipsis text-sm">
                    {leader?.name ?? "leader"}
                  </h1>
                  <Link
                    className="opacity-50"
                    href={member?.github ?? "github.com"}
                    target="_blank"
                  >
                    <FaGithub className="size-6" />
                  </Link>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  } else {
    return <p className="text-xl text-destructive">Team unavailable</p>;
  }
}
