import { api } from "~/utils/api";
import TeamDetails from "~/components/forms/teamInfo";
import CreateTeam from "~/components/forms/createTeam";
import ProfileCard from "~/components/profile";
import NotLoggedIn from "~/components/notLoggedIn";
import RootLayout from "~/components/layout";
import { Loader2Icon, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import TridentSpinner from "~/components/spinner/thunderSpinner";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Session } from "next-auth";
import { z } from "zod";
import { inferRouterOutputs } from "@trpc/server";
import { userRouter } from "~/server/api/routers/user";
import ProfilePhoto from "~/components/profile/profilePhoto";

export default function ProfilePage() {
  const { data, status } = useSession();
  const [delay, setDelay] = useState(true);
  const user = api.user.getUserDetails.useQuery();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelay(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (status === "loading" || user.isLoading || delay) {
    return <TridentSpinner />;
  } else if (status === "unauthenticated") {
    return <NotLoggedIn />;
  } else {
    return (
      <RootLayout>
        <div className="min-h-screen bg-gradient-to-b flex justify-center items-center from-[#0b1328] from-[10%] via-[#153164] to-[#0b1328]">
          <div className="mx-auto py-40 flex w-full max-w-7xl flex-col justify-center">
            {data?.user && (
              <Card className="bg-black/50">
                <CardHeader>
                  <CardTitle className="my-4 text-center text-3xl font-bold md:text-4xl">
                    Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 grid-cols-1 gap-2">
                  <ProfilePhoto
                    progress={data.user.profileProgress}
                    isLeader={data.user.isLeader}
                    image={data.user.image ?? "https://github.com/shadcn.png"}
                  />
                  {user.data && <Content user={user.data} />}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </RootLayout>
    );
  }
}




function Content({
  user,
}: {
  user: inferRouterOutputs<typeof userRouter>["getUserDetails"];
}) {
  const router = useRouter();

  switch (user?.profileProgress) {
    case "FILL_DETAILS":
      return (
        <div className="flex flex-col flex-nowrap items-center justify-center">
          <p className="text-center font-medium leading-8 md:text-xl">
            Welcome <span className="font-bold">{user.name}</span>. <br />
            Register below to prove your worthiness
          </p>
          <div className="mt-8 flex w-full flex-nowrap justify-evenly">
            <Button
              onClick={async () => {
                await router.push("/register");
              }}
            >
              Register
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await signOut({
                  callbackUrl: "/",
                });
              }}
            >
              Log out
            </Button>
          </div>
        </div>
      );

    case "FORM_TEAM":
      return <ProfileCard user={user} />;
  }
}
