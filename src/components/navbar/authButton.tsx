import { SessionProvider, signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "../ui/button";
import { FiLogIn } from "react-icons/fi";
// import Link from "next/link";
// import { useRouter } from "next/router";
import { RiErrorWarningFill } from "react-icons/ri";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

const AuthButton = () => {
  return (
    <SessionProvider>
      <SessionButton />
    </SessionProvider>
  );
};

const SessionButton = () => {
  const { data: session } = useSession();
  // const router = useRouter();

  return (
    <div className="flex justify-center pl-4">
      {session ? (
        session.user.profileProgress === "FILL_DETAILS" ? (
          <Button className="flex flex-nowrap items-center gap-2">
            {/* <Trophy /> */}
            <a href={"/register"}>Register</a>
          </Button>
        ) : (
          <>
            <div className="relative h-fit w-fit rounded-full">
              <a href={"/profile"} className="rounded-full">
                <Image
                  src={session.user.image!}
                  width={40}
                  height={40}
                  alt="profile"
                  className="rounded-full"
                />
              </a>
              {session.user.profileProgress !== "COMPLETE" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="absolute -bottom-1 -right-1">
                      <RiErrorWarningFill className=" size-5  animate-click-me rounded-full bg-white fill-yellow-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      {session.user.profileProgress === "FORM_TEAM" &&
                        "Pending Team deatils"}
                      {session.user.profileProgress === "SUBMIT_IDEA" &&
                        "Pending Idea submission"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </>
        )
      ) : (
        <Button
          onClick={() => signIn("google")}
          color="white"
          className="flex items-center gap-2"
        >
          <FiLogIn />
          Login
        </Button>
      )}
    </div>
  );
};

export default AuthButton;
