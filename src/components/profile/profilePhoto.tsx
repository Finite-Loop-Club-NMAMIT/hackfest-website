import Image from "next/image";
import ManageAccount from "./manageAccount";
import { type Progress } from "@prisma/client";

export default function ProfilePhoto({
  image,
  isLeader,
  progress,
}: {
  image: string;
  isLeader: boolean;
  progress: Progress;
}) {
  if (isLeader) {
    return (
      <div className="order-1 flex min-h-[60dvh] flex-col items-center justify-center md:min-h-0">
        <div className="relative p-10 md:p-8">
          <Image
            src={image}
            width={100}
            height={100}
            className="z-0 size-28 rounded-full md:size-36"
            alt="profile"
          />
          <Image
            src={"/images/crown-gold.svg"}
            width={100}
            height={100}
            className="absolute left-4 top-3 z-10 size-40 rounded-full md:-top-2 md:left-0 md:size-52"
            alt="profile"
          />
        </div>
        {progress !== "FILL_DETAILS" && <ManageAccount />}
      </div>
    );
  } else {
    return (
      <div className="order-1 flex min-h-[60dvh] flex-col items-center justify-center md:min-h-0">
        <div className="relative p-10 md:p-8">
          <Image
            src={image}
            width={100}
            height={100}
            className="z-0 size-28 rounded-full md:size-36"
            alt="profile"
          />
          <Image
            src={"/images/crown-green.svg"}
            width={100}
            height={100}
            className="absolute left-4 top-5 z-10 size-40 rounded-full md:left-0 md:top-2 md:size-52"
            alt="profile"
          />
        </div>
        {progress !== "FILL_DETAILS" && <ManageAccount />}
      </div>
    );
  }
}
