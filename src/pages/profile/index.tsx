import { api } from "~/utils/api";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { inferRouterOutputs } from "@trpc/server";
import type { userRouter } from "~/server/api/routers/user";

import ProfileCard from "~/components/profile";
import NotLoggedIn from "~/components/notLoggedIn";
import RootLayout from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import TridentSpinner from "~/components/spinner/thunderSpinner";
import ProfilePhoto from "~/components/profile/profilePhoto";
import * as Appsetting from "~/components/appSettingValidator";

function getArenaNumber(arenaCode: string | undefined | null): string {
  if (!arenaCode) return "";
  
  const arenaMap: Record<string, number> = {
    "ADL03": 1,
    "ADL04": 2,
    "SMVL51": 3,
    "SMVL52": 4,
    "SMVL54": 5
  };
  
  const arenaNumber = arenaMap[arenaCode];
  return arenaNumber ? `${arenaCode} (Arena ${arenaNumber})` : arenaCode;
}

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
        <Appsetting.Provider>
          <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0b1328] from-[10%] via-[#153164] to-[#0b1328] px-2">
            <div className="mx-auto flex w-full max-w-7xl flex-col justify-center py-40">
              {data?.user && (
                <Card className="rounded-md border border-white/20 bg-black/50">
                  <CardHeader>
                    <CardTitle className="gradient-text my-4 text-center text-3xl font-bold md:text-4xl">
                      Your Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex h-fit grid-cols-2 flex-col justify-evenly gap-2 md:grid">
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
        </Appsetting.Provider>
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
        <div className="order-2 flex flex-col flex-nowrap items-center justify-center">
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
      return (
        <ProfileCard
          user={user}
          order={[3, 4, 2, 0]}
          teamNo={user.Team?.teamProgress === "SELECTED" ? user.Team?.teamNo : undefined}
        />
      );
    case "SUBMIT_IDEA":
      return (
        <ProfileCard
          user={user}
          order={[3, 5, 4, 2]}
          teamNo={user.Team?.teamProgress === "SELECTED" ? user.Team?.teamNo : undefined}
        />
      );
    case "COMPLETE":
      return (
        <ProfileCard
          user={user}
          order={[2, 5, 3, 4]}
          boysDormitory={user.Team?.boysDormitory}
          girlsDormitory={user.Team?.girlsDormitory}
          arena={getArenaNumber(user.Team?.arena)}
          teamNo={user.Team?.teamProgress === "SELECTED" ? user.Team?.teamNo : undefined}
        />
      );
  }
}
