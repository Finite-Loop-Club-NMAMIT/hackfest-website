import Image from "next/image";
import { type inferRouterOutputs } from "@trpc/server";
import React from "react";
import { type userRouter } from "~/server/api/routers/user";

export default function IdentityDetails({
  user,
}: {
  user: inferRouterOutputs<typeof userRouter>["getUserDetails"];
}) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-md border-2 p-2">
      <h1 className="text-xl">Identify Proofs</h1>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="container flex justify-center">
            {user?.aadhaar && (
              <Image
                src={user?.aadhaar.split(";")[0] ?? ""}
                className="size-36 border-2 object-contain p-2 sm:size-44 md:size-56"
                height={100}
                width={100}
                alt="aadhaar"
              />
            )}
          </div>
          <p className="mt-2 text-center">Aadhaar</p>
        </div>
        <div>
          <div className="container flex justify-center">
            {user?.aadhaar && (
              <Image
                src={user?.college_id?.split(";")[0] ?? ""}
                className="size-36 border-2 object-contain p-2 sm:size-44 md:size-56"
                height={100}
                width={100}
                alt="college ID"
              />
            )}
          </div>
          <p className="mt-2 text-center">College ID</p>
        </div>
      </div>
    </div>
  );
}
