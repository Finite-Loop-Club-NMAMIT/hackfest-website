import React from "react";
import { type inferRouterOutputs } from "@trpc/server";
import { type userRouter } from "~/server/api/routers/user";

import PersonalDeatils from "./personalDetails";
import TeamDetails from "./teamDetails";
import IdentityDetails from "./identityDetails";
import IdeaDetails from "./ideaDetails";

interface ProfileCardProps {
  user: inferRouterOutputs<typeof userRouter>["getUserDetails"];
  order: number[];
  boysDormitory?: string | null; // Expect string | null | undefined
  girlsDormitory?: string | null; // Expect string | null | undefined
  arena?: string | null; // Expect string | null | undefined
}

export default function ProfileCard({
  user,
  order,
  boysDormitory,
  girlsDormitory,
  arena,
}: ProfileCardProps) {
  return (
    <>
      <PersonalDeatils user={user} order={order[0] ?? 2} />
      <IdentityDetails user={user} order={order[1] ?? 3} />
      {/* Pass allocation props to TeamDetails */}
      <TeamDetails
        user={user}
        order={order[2] ?? 4}
        boysDormitory={boysDormitory}
        girlsDormitory={girlsDormitory}
        arena={arena}
      />
      <IdeaDetails order={order[3] ?? 5} />
      {/* Removed the Allocation Details section from here */}
    </>
  );
}
