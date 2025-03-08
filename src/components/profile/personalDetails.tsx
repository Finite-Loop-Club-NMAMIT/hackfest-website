import { Building2, Github, Mail, Phone } from "lucide-react";
import React from "react";
import { Input } from "../ui/input";
import { type inferRouterOutputs } from "@trpc/server";
import { type userRouter } from "~/server/api/routers/user";
import { FaHouseFlag } from "react-icons/fa6";

export default function PersonalDeatils({
  user,
  order,
}: {
  user: inferRouterOutputs<typeof userRouter>["getUserDetails"];
  order: number;
}) {
  return (
    <>
      <div
        className="flex h-full w-full flex-col rounded-md border-2 p-2"
        style={{ order: order }}
      >
        <h1 className="text-xl">Personal Details</h1>
        <div className="flex h-full w-full flex-col justify-evenly gap-2">
          <div className="flex h-auto w-full flex-nowrap">
            <div className="flex items-center text-left">
              <Mail className="ml-auto size-8 h-full  rounded-l-md border-[1px] border-r-[0px] bg-black/30 p-1" />
            </div>
            <Input
              readOnly
              className="rounded-l-none pl-5 focus-visible:ring-[0px]"
              value={user?.email ?? "goofer@hackfest.dev"}
            />
          </div>
          <div className="flex h-auto w-full flex-nowrap">
            <div className="flex items-center text-left">
              <Phone className="ml-auto size-8 h-full  rounded-l-md border-[1px] border-r-[0px] bg-black/30 p-1" />
            </div>
            <Input
              readOnly
              className="rounded-l-none pl-5 focus-visible:ring-[0px]"
              value={user?.phone ?? "0123456789"}
            />
          </div>
          <div className="flex h-auto w-full flex-nowrap">
            <div className="flex items-center text-left">
              <Building2 className="ml-auto size-8 h-full  rounded-l-md border-[1px] border-r-[0px] bg-black/30 p-1" />
            </div>
            <Input
              readOnly
              className="rounded-l-none pl-5 focus-visible:ring-[0px]"
              value={user?.College?.name ?? "University of Full time coders"}
            />
          </div>
          <div className="flex h-auto w-full flex-nowrap">
            <div className="flex items-center text-left">
              <FaHouseFlag className="ml-auto size-8 h-full  rounded-l-md border-[1px] border-r-[0px] bg-black/30 p-1" />
            </div>
            <Input
              readOnly
              className="rounded-l-none pl-5 focus-visible:ring-[0px]"
              value={user?.College?.state ?? "State not selected"}
            />
          </div>
          <div className="flex h-auto w-full flex-nowrap">
            <div className="flex items-center text-left">
              <Github className="ml-auto size-8 h-full  rounded-l-md border-[1px] border-r-[0px] bg-black/30 p-1" />
            </div>
            <Input
              readOnly
              className="rounded-l-none pl-5 focus-visible:ring-[0px]"
              value={user?.github ?? "University of Full time coders"}
            />
          </div>
        </div>
      </div>
    </>
  );
}
