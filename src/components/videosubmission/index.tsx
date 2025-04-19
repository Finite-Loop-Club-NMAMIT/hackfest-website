import React from "react";
import { api } from "~/utils/api";
import RegistrationClosed from "../message/registrationsClosed";
import { type Session } from "next-auth";
import Spinner from "../spinner";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";
import SubmitVideo from "./submitVideo";

export default function VideoSubmission({
  session,
}: {
  session: Session;
}) {
  const videoSubmissionQuery = api.video.isVideoSubmitted.useQuery();
  const router = useRouter();

  if (session.user.isLeader) {
    if (videoSubmissionQuery.isLoading) {
      return <Spinner />;
    } else if (videoSubmissionQuery.data) {
      return (
        <div className="rounded-lg bg-black/50 px-4 py-6 text-center">
          <h1 className="gradient-text my-2 text-3xl font-bold md:text-5xl">
            Success
          </h1>
          <p className="my-4 max-w-lg text-base opacity-80 md:text-lg">
            You have successfully submitted your video link! We wish you Good
            Luck in getting selected to Top 15.
          </p>
          <Button
            variant={"secondary"}
            onClick={async () => {
              await router.push("/profile");
            }}
          >
            Profile
          </Button>
        </div>
      );
    } else {
      return <SubmitVideo />
    }
  } else {
    return (
      <RegistrationClosed
        session={session}
        heading="Oops!"
        message="Only the leader can submit video"
      />
    );
  }
}
