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
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function DAY1() {
  const teamsQuery = api.judges.getTeams.useQuery();
  const teams = teamsQuery.data;
  const { data: user } = useSession();

  const [updatedRemarks, setUpdatedRemarks] = useState<string>("");

  const addRemark = api.remark.addRemark.useMutation({
    onSuccess: async () => {
      await teamsQuery.refetch();
      toast.success("Remark updated successfully");
    },
  });

  if (!user?.user) {
    return <div>Unauthorized</div>;
  }

  const handleAddRemark = async (teamId: string, remark: string) => {
    await addRemark.mutateAsync({
      teamId: teamId,
      judgeId: user?.user?.id,
      remark: remark,
    });
  };
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

                        <div className="flex-flex-col h-[60%]  w-full space-y-6 pt-4">
                          <h3 className="text-3xl">Remarks</h3>
                          <Textarea
                            rows={3}
                            onChange={(e) => {
                              setUpdatedRemarks(e.target.value);
                            }}
                          />
                          {teamsQuery.status === "success" && (
                            <Button
                              onClick={async () => {
                                await handleAddRemark(team.id, updatedRemarks);
                              }}
                            >
                              Add Remark
                            </Button>
                          )}
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
