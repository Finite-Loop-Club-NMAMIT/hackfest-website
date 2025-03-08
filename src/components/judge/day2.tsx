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

export default function DAY2() {
  const teamsQuery = api.judges.getTeams.useQuery();
  const teams = teamsQuery.data;
  const criterias = api.judges.getCriterias.useQuery({
    judgeType: "DAY2",
  }).data;
  const updateScore = api.judges.setScore.useMutation();

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

                        <div className="flex h-[60%] w-full items-center  justify-center pt-8">
                          <div className="flex flex-col items-center justify-center gap-4">
                            <h3 className="text-3xl">Score</h3>
                            <div className="flex h-full w-full flex-col items-center justify-center gap-6">
                              {criterias?.map((criteria, index) => {
                                return (
                                  <div
                                    className="grid grid-cols-2 gap-4"
                                    key={index}
                                  >
                                    <span>{criteria.criteria}</span>
                                    <input
                                      onBlur={async (e) => {
                                        if (e.target.value)
                                          await updateScore.mutateAsync({
                                            teamId: team.id,
                                            criteriaId: criteria.id,
                                            score: Number(e.target.value),
                                          });
                                      }}
                                      defaultValue={
                                        team.Scores?.find(
                                          (score) =>
                                            score.criteriaId === criteria.id,
                                        )?.score
                                      }
                                      type="number"
                                      name="score"
                                      id="score"
                                      className="  h-8 w-12 rounded-md border-gray-300 text-center text-gray-700 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                    />
                                  </div>
                                );
                              })}
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
