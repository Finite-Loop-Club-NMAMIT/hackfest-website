import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface User {
  id: string;
  image: string | null;
  name: string | null;
  isLeader: boolean;
}

export default function AnimatedAvatarGroup({ users }: { users: Array<User> }) {
  return (
    <div className="flex">
      {users.map((user,idx) => (
        <div key={user.id} className={`border-2 rounded-full z-${idx}`}>
          <Avatar className="relative">
            <AvatarImage src={user.image ?? "https://github.com/shadcn.png"} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      ))}
      {users.map((user) => (
        <Avatar key={user.id} className="relative">
          <AvatarImage src={user.image ?? "https://github.com/shadcn.png"} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}
