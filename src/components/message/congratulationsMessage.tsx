import React from "react";
import { useRouter } from "next/router";
import { Button } from "../ui/button";

export default function CongratulationMessage() {
  const router = useRouter();

  return (
    <div className="mx-4 flex w-full max-w-5xl transform flex-col items-center justify-center rounded-lg border border-white/20 bg-black/50 p-4 shadow-lg transition duration-500 ease-in-out">
      <h1 className="gradient-text mt-2 text-center text-3xl font-bold text-white drop-shadow-xl md:text-6xl">
        Idea Submitted!
      </h1>
      <p className="p-4 text-center text-sm text-white md:text-lg">
        You have already submitted your idea. We wish you to be in the top 60
        teams. Keep an eye on your mail for further updates.
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
}
