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
import IdeaSubmitForm from "../forms/ideaSubmitForm";

const templateURL =
  "https://res.cloudinary.com/dwwno9ngw/raw/upload/v1737346827/Hackathon_Abstract_Submission_-_Goopy_Gophers_mjnwtt.pptx";

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
            <RegistrationClosed session={session} />
          </AppSetting.FallBack>
        </AppSetting.Provider>
      );

    case "FORM_TEAM":
      return (
        <AppSetting.Provider value={settings?.isRegistrationOpen ?? false}>
          <AppSetting.Active>
            {session.user.team?.id ? (
              <InTeam isLeader={session.user.isLeader} />
            ) : (
              <FormTeam />
            )}
          </AppSetting.Active>
          <AppSetting.FallBack>
            <RegistrationClosed session={session} />
          </AppSetting.FallBack>
        </AppSetting.Provider>
      );

    case "SUBMIT_IDEA":
      return (
        <AppSetting.Provider value={settings?.isRegistrationOpen ?? false}>
          <AppSetting.Active>
            <div className="flex h-full w-full justify-center pt-14 md:pt-8">
              {session.user.isLeader ? (
                <IdeaSubmitForm />
              ) : (
                <div className="flex w-full max-w-3xl flex-col justify-center rounded-md bg-black/50 p-8">
                  <h1 className="bg-gradient-to-b from-orange-200 via-orange-700 to-orange-500 bg-clip-text text-center text-3xl font-bold text-transparent md:text-5xl">
                    Not allowed!
                  </h1>
                  <p className="mt-4 text-center">
                    Only the team leader can submit the idea. Only ideas
                    submitted using the{" "}
                    <a
                      download={"idea_template.pptx"}
                      href={templateURL}
                      className="underline"
                    >
                      template
                    </a>{" "}
                    provided will be considered.
                  </p>
                  <Button
                    className="mx-auto mt-2"
                    onClick={async() => {
                      await router.push("/profile");
                    }}
                  >
                    Profile
                  </Button>
                </div>
              )}
            </div>
          </AppSetting.Active>
          <AppSetting.FallBack>
            <RegistrationClosed session={session} />
          </AppSetting.FallBack>
        </AppSetting.Provider>
      );

    case "PAYMENT":
      return <p>Payment</p>;

    case "COMPLETE":
      return <p>Complete</p>;

    default:
      return "something went wrong";
  }
}

function RegistrationClosed({ session }: { session: Session }) {
  const router = useRouter();

  return (
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
  );
}
