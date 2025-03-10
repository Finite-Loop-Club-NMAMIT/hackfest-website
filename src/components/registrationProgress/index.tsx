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
import { downloadPPT } from "~/utils/helper";
import RegistrationClosed from "../message/registrationsClosed";
import type { PaymentStatus } from "@prisma/client";
import PaymentComponent from "../payment";
import PaymentVerification from "../payment/verify";
import PaymentSuccess from "../payment/success";

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
      if (session.user.team?.ideaSubmission) {
        return (
          <div className="flex w-full max-w-5xl transform flex-col items-center justify-center rounded-lg bg-gradient-to-r from-black/50 via-blue-700/50 to-black/50 p-6 shadow-lg transition duration-500 ease-in-out">
            <h1 className="gradient-text mt-2 text-center text-3xl font-bold text-white drop-shadow-xl md:text-6xl">
              Idea Submitted!
            </h1>
            <p className="p-4 text-center text-sm text-white md:text-lg">
              You have already submitted your idea. We wish you to be in the top
              60 teams.
            </p>
            <div className="mt-4">
              <svg
                className="h-16 w-16 animate-bounce text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-3.5 2.1 1-4.2-3.2-2.8 4.3-.4L10 6l1.4 3.7 4.3.4-3.2 2.8 1 4.2z" />
              </svg>
            </div>
            <Button
              className="mt-4"
              onClick={async () => {
                await router.push("/profile");
              }}
            >
              Profile
            </Button>
          </div>
        );
      } else {
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
                      The team leader should submit the idea. Only ideas
                      submitted using the{" "}
                      <button
                        onClick={async () => {
                          await downloadPPT();
                        }}
                        className="underline"
                      >
                        template
                      </button>{" "}
                      provided will be considered.
                    </p>
                    <Button
                      className="mx-auto mt-2"
                      onClick={async () => {
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
      }

    case "COMPLETE":
      return (
        <AppSetting.Provider value={settings?.isPaymentOpen ?? false}>
          <AppSetting.Active>
            {session.user.team?.teamProgress === "SELECTED" ? (
              <PaymentCondition paymentStatus={session.user.team.paymentStatus} />
            ) : (
              <RegistrationClosed
                session={session}
                message="You are not selected in the top 60's"
                heading="Sorry!"
              />
            )}
          </AppSetting.Active>
          <AppSetting.FallBack>
            {session.user.team?.teamProgress === "SELECTED" ? (
              <RegistrationClosed
                session={session}
                message="Payment submission is now closed"
                heading="Too Late!"
              />
            ) : (
              <RegistrationClosed
                session={session}
                message="You are not selected in the top 60's"
                heading="Sorry!"
              />
            )}
          </AppSetting.FallBack>
        </AppSetting.Provider>
      );
    // return (
    //   <div className="mx-4 flex w-full max-w-5xl transform flex-col items-center justify-center rounded-lg border border-white/20 bg-black/50 p-4 shadow-lg transition duration-500 ease-in-out">
    //     <h1 className="gradient-text mt-2 text-center text-3xl font-bold text-white drop-shadow-xl md:text-6xl">
    //       Idea Submitted!
    //     </h1>
    //     <p className="p-4 text-center text-sm text-white md:text-lg">
    //       You have already submitted your idea. We wish you to be in the top
    //       60 teams.
    //     </p>
    //     <div className="mt-4">
    //       <svg
    //         className="h-16 w-16 animate-bounce text-yellow-400"
    //         fill="currentColor"
    //         viewBox="0 0 20 20"
    //       >
    //         <path d="M10 15l-3.5 2.1 1-4.2-3.2-2.8 4.3-.4L10 6l1.4 3.7 4.3.4-3.2 2.8 1 4.2z" />
    //       </svg>
    //     </div>
    //     <Button
    //       className="mt-4"
    //       onClick={async () => {
    //         await router.push("/profile");
    //       }}
    //     >
    //       Profile
    //     </Button>
    //   </div>
    // );

    default:
      return (
        <AppSetting.Provider value={true}>
          <AppSetting.Active>
            <RegistrationClosed session={session} />
          </AppSetting.Active>
        </AppSetting.Provider>
      );
  }
}

function PaymentCondition({ paymentStatus }: { paymentStatus: PaymentStatus }) {
  switch(paymentStatus) {
    case "PENDING":
      return <PaymentComponent />

    case "VERIFY":
      return <PaymentVerification />;

    case "PAID":
      return <PaymentSuccess />;
  }
}