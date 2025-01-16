import React from "react";
import { type inferRouterOutputs } from "@trpc/server";
import { type appSettingsRouter } from "~/server/api/routers/app";

import AppSettingValidator from "../appSettingValidator";
import FillDetails from "./fillDetails";
import FormTeam from "./formTeam";

export default function RegisterCards({
  progress,
  settings,
}: {
  progress: string;
  settings:
    | inferRouterOutputs<typeof appSettingsRouter>["getAppSettings"]
    | null;
}) {
  switch (progress) {
    case "FILL_DETAILS":
      return (
        <AppSettingValidator open={settings?.isRegistrationOpen ?? false} text="The registrations are now closed.">
          <FillDetails />
        </AppSettingValidator>
      );

    case "FORM_TEAM":
      return (
        <AppSettingValidator open={settings?.isRegistrationOpen ?? false} text="Team registrations are now closed">
          <FormTeam />
        </AppSettingValidator>
      );

    case "SUBMIT_IDEA":
      return <p>Submit idea</p>;

    case "PAYMENT":
      return <p>Payment</p>;

    case "COMPLETE":
      return <p>Complete</p>;
  }
}
