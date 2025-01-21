import TeamInfo from "./teamInfo";
import { type Progress } from "@prisma/client";
import { Loader2Icon } from "lucide-react";
import { useContext } from "react";
import { ProgressContext } from "~/components/progressProvider";
import { Card } from "~/components/ui/card";
import { api } from "~/utils/api";

export default function TeamDetails({
  teamid,
  userId,
  userProgress,
  userRefetch,
  userIsLeader,
}: {
  teamid: string;
  userId: string;
  userProgress: Progress;
  userRefetch: () => void;
  userIsLeader: boolean;
}) {
  const teamdata = api.team.getTeamDetailsById.useQuery({
    teamId: teamid,
  });
  const { currentState } = useContext(ProgressContext);
  if (currentState !== 1) return null;

  return (
    <>
      {currentState === 1 && teamdata.isLoading && (
        <Card className="flex h-96 w-full items-center justify-center gap-2">
          Loading...
          <Loader2Icon className="animate-spin" />
        </Card>
      )}
      {!teamdata.isLoading && teamdata.data && (
        <TeamInfo
          userRefetch={userRefetch}
          userId={userId}
          userIsLeader={userIsLeader}
          teamdata={teamdata.data}
          userProgress={userProgress}
          refetchTeam={teamdata.refetch}
        />
      )}
    </>
  );
}
