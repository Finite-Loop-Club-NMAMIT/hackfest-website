import Image from "next/image";
import React from "react";
import AuthButton from "../navbar/authButton";
import Link from "next/link";

export default function ChatNavbar() {
  return (
    <div className="flex items-center justify-between bg-blue-950 px-6 py-4">
      <Link href={"/"}>
        <Image
          src={"/logos/logo.png"}
          height={100}
          width={100}
          className="size-16"
          alt="Hackfest Logo"
        />
      </Link>
      <Link href={"/profile"} className="flex flex-row flex-nowrap items-center gap-1 rounded-full border border-blue-500/50 bg-blue-500/20 p-1 pl-6 text-white">
        <p>Profile</p>
        <AuthButton className="pointer-events-none" />
      </Link>
    </div>
  );
}
