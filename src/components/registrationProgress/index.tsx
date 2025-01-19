import React from "react";
import { type inferRouterOutputs } from "@trpc/server";
import { type appSettingsRouter } from "~/server/api/routers/app";
import { type Session } from "next-auth";

import * as AppSetting from "../appSettingValidator";
import FillDetails from "./fillDetails";
import FormTeam from "./formTeam";
import InTeam from "../registered/InTeam";
import { Button } from "../ui/button";
import { useRouter } from "next/router";

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
  const router = useRouter();

  switch (progress) {
    case "FILL_DETAILS":
      return (
        <AppSetting.Provider value={settings?.isRegistrationOpen ?? false}>
          <AppSetting.Active>
            <FillDetails />
          </AppSetting.Active>
          <AppSetting.FallBack>
            <div className="flex h-screen w-screen items-center justify-center">
              <div className="mx-4 h-fit w-full max-w-[70rem] rounded-xl bg-black/50 p-10 text-center text-white">
                <h1 className="bg-gradient-to-b from-red-300 via-red-800 to-red-500 bg-clip-text text-5xl font-bold text-transparent md:text-8xl">
                  Too Late!
                </h1>
                <p className="mt-8 md:text-xl">
                  Sorry{" "}
                  <span className="font-semibold">
                    {session.user.name ?? "Tech Enthusiast"}
                  </span>
                  . Registrations are now closed.
                </p>
                <Button
                  className="mt-8"
                  variant="outline"
                  onClick={() => {
                    void router.push("/");
                  }}
                >
                  Home
                </Button>
              </div>
            </div>
          </AppSetting.FallBack>
        </AppSetting.Provider>
      );

    case "FORM_TEAM":
      if (session.user.team?.id) {
        return <InTeam isLeader={session.user.isLeader} />;
      } else {
        return (
          <AppSetting.Provider value={settings?.isRegistrationOpen ?? false}>
            <AppSetting.Active>
              <FormTeam />
            </AppSetting.Active>
            <AppSetting.FallBack>
              <p>Team registrations are now closed</p>
            </AppSetting.FallBack>
          </AppSetting.Provider>
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
