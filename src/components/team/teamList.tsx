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

export default function TeamList({ teamId }:{ teamId:string }) {
  const teamDetails = api.team.getTeamDetailsById.useQuery({ teamId: teamId });
  const [leader, setLeader] = useState<Member | null>(null);

  useEffect(() => {
    const members = teamDetails.data?.members
    let temp;

    if(members && members.length > 0){
      temp = members.filter((member) => {
        if(member.isLeader){
          return member
        }
      })
    }
    
    temp && temp.length > 0 ? setLeader(temp[0] as Member) : setLeader(null);    
  }, [teamDetails.data]);

  if (teamDetails.isLoading) {
    return <div className="p- rounded-md border-2">loading</div>;
  } else {
    return (
      <div className="mt-4 flex w-full max-w-md flex-col gap-1">
        <div className="flex w-full flex-row flex-nowrap items-center gap-4 rounded-md border-2 p-1 px-2">
          <Image
            className="size-10 rounded-full border-4 border-yellow-500"
            src={leader?.image ?? "https://github.com/shadcn.png"}
            alt="leader"
            width={100}
            height={100}
          />
          <h1 className=" text-ellipsis text-sm w-full">
            {leader?.name ?? "leader"}
          </h1>
          <div className="opacity-50">
            <FaGithub className="size-6" />
          </div>
        </div>
        {teamDetails.data?.members.map((member) => {
          if (!member.isLeader) {
            return (
              <div
                key={member.id}
                className="flex w-full flex-row flex-nowrap items-center gap-4 rounded-md border-2 p-1"
              >
                <Image
                  className="size-10 rounded-full border-4 border-white"
                  src={member.image ?? "https://github.com/shadcn.png"}
                  alt="leader"
                  width={100}
                  height={100}
                />
                <h1 className="w-full truncate">{member?.name ?? "leader"}</h1>
                <Link
                  className="flex flex-row flex-nowrap items-center justify-center gap-1 text-nowrap underline opacity-50"
                  href={`github.com/${member?.github ?? ""}`}
                >
                  <FaGithub />
                  {leader?.github}
                </Link>
              </div>
            );
          }
        })}
      </div>
    );
  }
}
