import React from "react";
import type { Session } from "next-auth";
import { useRouter } from "next/router";
import { Button } from "../ui/button";

export default function RegistrationClosed({
  session,
  message = "Registrations are now closed",
  heading = "Too Late!",
}: {
  session: Session;
  message?: string;
  heading?: string;
}) {
  const router = useRouter();

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="mx-4 h-fit w-full max-w-[70rem] rounded-xl border border-white/20 bg-black/50 p-10 text-center text-white">
        <h1 className="bg-gradient-to-b from-red-300 via-red-800 to-red-500 bg-clip-text text-5xl font-bold text-transparent md:text-8xl">
          {heading}
        </h1>
        <p className="mt-8 md:text-xl">
          Sorry{" "}
          <span className="font-semibold">
            {session.user?.name ?? "Tech Enthusiast"}
          </span>{" "}
          😞 . {message}.
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