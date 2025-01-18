import Image from "next/image";
import ManageAccount from "./manageAccount";
import { Progress } from "@prisma/client";

export default function ProfilePhoto({
  image,
  isLeader,
  progress
}: {
  image: string;
  isLeader: boolean;
  progress: Progress;
}) {
  if (isLeader) {
    return (
      <div className="pb-8">
        <div className="relative mx-auto size-52 p-8">
          <Image
            src={image}
            width={100}
            height={100}
            className="z-0 h-full w-full rounded-full"
            alt="profile"
          />
          <Image
            src={"/images/crown-gold.svg"}
            width={100}
            height={100}
            className="absolute -top-3 left-0 z-10 h-full w-full rounded-full"
            alt="profile"
          />
        </div>
        {progress !== "FILL_DETAILS" && <ManageAccount />}
      </div>
    );
  } else {
      return (
          <div className="pb-8">
        <div className="relative mx-auto size-52 p-6">
          <Image
            src={image}
            width={100}
            height={100}
            className="z-0 h-full w-full rounded-full"
            alt="profile"
          />
          <Image
            src={"/images/crown-green.svg"}
            width={100}
            height={100}
            className="absolute left-0 top-3 z-10 h-full w-full rounded-full"
            alt="profile"
            />
        </div>
        {progress !== "FILL_DETAILS" && <ManageAccount />}
      </div>
    );
  }
}
