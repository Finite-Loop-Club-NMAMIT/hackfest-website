import React from "react";
import { type inferRouterOutputs } from "@trpc/server";
import { type userRouter } from "~/server/api/routers/user";

import PersonalDeatils from "./personalDetails";
import TeamDetails from "./teamDetails";
import IdentityDetails from "./identityDetails";

export default function ProfileCard({
  user,
}: {
  user: inferRouterOutputs<typeof userRouter>["getUserDetails"];
}) {
  return (
    <>
    <TeamDetails user={user}/>
    <PersonalDeatils user={user}/>
    <IdentityDetails user={user} />
    </>
  )
}
