import { api } from "~/utils/api";
import TeamDetails from "~/components/forms/teamInfo";
import CreateTeam from "~/components/forms/createTeam";
import { Profile } from "~/components/profile";
import NotLoggedIn from "~/components/notLoggedIn";
import RootLayout from "~/components/layout";
import { Loader2Icon } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";

export default function ProfilePage() {
  const userInfo = api.user.getUserWithTeam.useQuery();

  if (!userInfo.isLoading && !userInfo.data) return <NotLoggedIn />;

  return (
    <RootLayout>
      <div
        className="bg-gradient-to-b from-[#060e3c] via-[#052d4f] to-[#001933]"
        style={{
          background:
            "url('/images/noise.svg') repeat,linear-gradient(180deg, #060e3c 0%, #052d4f 30%, #001933 100%)",
        }}
      >
        <div className="md:px-auto mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-2 p-3 pb-10 pt-28 md:pb-20">
          {userInfo.isLoading ? (
            <Card className="w-h-96 flex h-96 items-center justify-center gap-2">
              Loading...
              <Loader2Icon className="animate-spin" />
            </Card>
          ) : (
            userInfo.data && (
              <Profile user={userInfo.data} refetch={userInfo.refetch} />
            )
          )}
          {userInfo.isLoading ? (
            <></>
          ) : !userInfo.data?.team?.id ? (
            // <CreateTeam refetch={userInfo.refetch} />
            <></>
          ) : (
            <TeamDetails
              userId={userInfo.data.id}
              userIsLeader={userInfo.data.isLeader}
              teamid={userInfo.data.team.id}
              userProgress={userInfo.data.profileProgress}
              userRefetch={userInfo.refetch}
            />
          )}
        </div>
      </div>
    </RootLayout>
  );
}
