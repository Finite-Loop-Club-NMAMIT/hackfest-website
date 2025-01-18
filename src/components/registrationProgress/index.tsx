import React from "react";
import { type inferRouterOutputs } from "@trpc/server";
import { type appSettingsRouter } from "~/server/api/routers/app";
import { type Session } from "next-auth";

import AppSettingValidator from "../appSettingValidator";
import FillDetails from "./fillDetails";
import FormTeam from "./formTeam";
import InTeam from "../registered/InTeam";

export default function RegisterCards({
  session,
  progress,
  settings,
}: {
  session: Session;
  progress: string;
  settings:
    | inferRouterOutputs<typeof appSettingsRouter>["getAppSettings"]
    | null;
}) {
  switch (progress) {
    case "FILL_DETAILS":
      return (
        <AppSettingValidator
          open={settings?.isRegistrationOpen ?? false}
          text="The registrations are now closed."
        >
          <FillDetails />
        </AppSettingValidator>
      );

    case "FORM_TEAM":
      if (session.user.team?.id) {
        return <InTeam isLeader={session.user.isLeader}/>
      } else {
        return (
          <AppSettingValidator
            open={settings?.isRegistrationOpen ?? false}
            text="Team registrations are now closed"
          >
            <FormTeam />
          </AppSettingValidator>
        );
      }

    case "SUBMIT_IDEA":
      return <p>Submit idea</p>;

    case "PAYMENT":
      return <p>Payment</p>;

    case "COMPLETE":
      return <p>Complete</p>;
  }
}
