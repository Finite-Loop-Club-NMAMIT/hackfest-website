import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { api } from "~/utils/api";
import Spinner from "../spinner";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { toast } from "sonner";

export default function DAY3() {
  const teamsQuery = api.judges.getTop15Teams.useQuery();
  const teams = teamsQuery.data;
  const changeProgress = api.organiser.changeTeamProgress.useMutation({
    onSuccess: async () => {
      await teamsQuery.refetch();
      toast.success("Team updated");
    },
  });
  return (
    <>
      {teamsQuery.status === "loading" && (
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner />
        </div>
      )}
      {teamsQuery.status === "success" && (
        <div className="flex w-full items-center justify-center">
          <Carousel className="m-auto flex h-screen w-[80vw] items-center justify-center">
            <CarouselContent>
              {teams?.map((team, index) => {
                return (
                  <CarouselItem key={index}>
                    <Card className="h-[80dvh]">
                      <CardContent className="flex h-full flex-col items-center justify-between p-8">
                        <div className="flex h-[40%] w-full flex-col items-center justify-center gap-5 border-b">
                          <h1 className="flex h-20 w-20 items-center justify-center rounded-full border text-center text-5xl font-bold">
                            {team.teamNo}
                          </h1>
                          <h1 className="text-5xl font-semibold">
                            {team.name}
                          </h1>
                          <h3 className="text-3xl">
                            {team.IdeaSubmission?.track.toUpperCase()}
                          </h3>
                        </div>

                        <div className="h-[60%] w-full pt-4">
                          <div className="flex flex-col gap-4">
                            <div className="flex h-full w-full flex-col items-center justify-center gap-6">
                              <Button
                                className={
                                  team.teamProgress === "WINNER"
                                    ? "bg-green-500 text-white hover:bg-green-500"
                                    : "bg-white text-black"
                                }
                                onClick={async () => {
                                  await changeProgress.mutateAsync({
                                    teamId: team.id,
                                    progress: "WINNER",
                                  });
                                }}
                              >
                                Winner
                              </Button>
                              <Button
                                className={
                                  team.teamProgress === "RUNNER"
                                    ? "bg-green-500 text-white hover:bg-green-500"
                                    : "bg-white text-black"
                                }
                                onClick={async () => {
                                  await changeProgress.mutateAsync({
                                    teamId: team.id,
                                    progress: "RUNNER",
                                  });
                                }}
                              >
                                Runner up
                              </Button>
                              <Button
                                className={
                                  team.teamProgress === "SECOND_RUNNER"
                                    ? "bg-green-500 text-white hover:bg-green-500"
                                    : "bg-white text-black"
                                }
                                onClick={async () => {
                                  await changeProgress.mutateAsync({
                                    teamId: team.id,
                                    progress: "SECOND_RUNNER",
                                  });
                                }}
                              >
                                Second Runner Up
                              </Button>
                              <Button
                                className={
                                  team.teamProgress === "TRACK"
                                    ? "bg-green-500 text-white hover:bg-green-500"
                                    : "bg-white text-black"
                                }
                                onClick={async () => {
                                  await changeProgress.mutateAsync({
                                    teamId: team.id,
                                    progress: "TRACK",
                                  });
                                }}
                              >
                                Track Winner
                              </Button>
                              <Button
                                variant={"destructive"}
                                onClick={async () => {
                                  await changeProgress.mutateAsync({
                                    teamId: team.id,
                                    progress: "TOP15",
                                  });
                                }}
                              >
                                Reset
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}
    </>
  );
}
