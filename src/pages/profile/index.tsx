import { api } from "~/utils/api";
import TeamDetails from "~/components/forms/teamInfo";
import CreateTeam from "~/components/forms/createTeam";
import ProfileCard from "~/components/profile";
import NotLoggedIn from "~/components/notLoggedIn";
import RootLayout from "~/components/layout";
import { Loader2Icon } from "lucide-react";
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

const defaultProfileImage =
  "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?w=900&t=st=1709875148~exp=1709875748~hmac=2f5b619c6bda073396a93cd48021b7013f5231bdfa745dcf976c260cca8c1b38";

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
        <div className="min-h-screen bg-gradient-to-b from-[#0b1328] from-[10%] via-[#153164] to-[#0b1328]">
          <div className="mx-auto flex w-full max-w-7xl flex-col justify-center">
            {data?.user && (
              <Card className="mx-4 bg-black/50 mt-44">
                <CardHeader>
                  <CardTitle className="text-center my-4 text-3xl font-bold md:text-4xl">
                    Your Profile
                  </CardTitle>
                  <div
                    className={`mx-auto w-fit ${data.user.isLeader ? "pt-10 p-7" : "p-6 pt-1"}`}
                    style={{
                      background: `url('/images/${data.user.isLeader ? "crown-gold" : "crown-green" }.svg')`,
                      backgroundSize: "cover", 
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    <Image
                      src={data.user.image ?? defaultProfileImage}
                      className="rounded-full z-0"
                      alt={`Profile image`}
                      width={100}
                      height={100}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {user.data && <Content user={user.data} />}
                  {/* {data.user.profileProgress === "FILL_DETAILS" && (
                    <NotRegisterd name={data.user.name ?? "User"} />
                  )}
                  {data.user.profileProgress === "FORM_TEAM" && <ProfileCard />} */}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </RootLayout>
    );
  }
}

function Content({ user }: { user: inferRouterOutputs<typeof userRouter>["getUserDetails"] }) {
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
      return <ProfileCard user={user}/>;
  }
}
