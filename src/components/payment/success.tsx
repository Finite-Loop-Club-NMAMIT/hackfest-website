import React from "react";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";

export default function PaymentSuccess() {
  const router = useRouter();

  return (
    <div className="rounded-lg bg-black/50 px-4 py-6 text-center">
      <h1 className="gradient-text my-2 text-3xl font-bold md:text-5xl">
        Success
      </h1>
      <p className="my-4 max-w-lg opacity-80 md:text-lg text-base">
        Your payment was successful! We look forward to seeing you during{" "}
        <b>Hackfest {"'"}25</b> on April 18th. Thank you for your participation!
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
}
