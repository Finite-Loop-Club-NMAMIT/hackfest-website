import React from "react";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";

export default function PaymentVerification() {
  const router = useRouter();

  return (
    <div className="rounded-lg bg-black/50 px-4 py-6 text-center">
      <h1 className="gradient-text my-2 text-3xl font-bold md:text-5xl">
        Verification
      </h1>
      <p className="my-4 max-w-lg opacity-80 md:text-lg text-base">
        Your Transaction ID has been submitted successfully. Please wait for the
        verification of the same.
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
