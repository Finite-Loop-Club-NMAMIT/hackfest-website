import React from "react";
import { type inferRouterOutputs } from "@trpc/server";
import { type userRouter } from "~/server/api/routers/user";

import PersonalDeatils from "./personalDetails";
import TeamDetails from "./teamDetails";
import IdentityDetails from "./identityDetails";
import IdeaDetails from "./ideaDetails";
import ResumeDetails from "./resume";

export default function ProfileCard({
  user,
  order,
}: {
  user: inferRouterOutputs<typeof userRouter>["getUserDetails"];
  order: Array<number>
}) {
  return (
    <>
    <TeamDetails user={user} order={order[0] ?? 1}/>
    <PersonalDeatils user={user} order={order[1] ?? 2}/>
    <IdentityDetails user={user} order={order[2] ?? 3}/>
    <IdeaDetails order={order[3] ?? 4}/>
    <ResumeDetails order={order[4] ?? 5}/>
    </>
  )
}
