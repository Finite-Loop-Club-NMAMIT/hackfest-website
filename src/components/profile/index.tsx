import React from "react";
import { type inferRouterOutputs } from "@trpc/server";
import { type userRouter } from "~/server/api/routers/user";

import PersonalDeatils from "./personalDetails";
import TeamDetails from "./teamDetails";
import IdentityDetails from "./identityDetails";
import IdeaDetails from "./ideaDetails";

export default function ProfileCard({
  user,
  order,
}: {
  user: inferRouterOutputs<typeof userRouter>["getUserDetails"];
  order: Array<number>;
}) {
  return (
    <>
      <PersonalDeatils user={user} order={order[0] ?? 2} />
      <IdentityDetails user={user} order={order[1] ?? 3} />
      <TeamDetails user={user} order={order[2] ?? 4} />
      <IdeaDetails order={order[3] ?? 5} />
    </>
  );
}
