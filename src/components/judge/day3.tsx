import { useSession } from "next-auth/react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "~/components/ui/carousel"
import { api } from "~/utils/api";
import Spinner from "../spinner";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { toast } from "sonner";
import TeamRemarks from "./teamRemarks";
  
export default function DAY3(){
    const { data, status } = useSession();
    const teamsQuery = api.judges.getTop15Teams.useQuery();
    const judgeDay = api.judges.getDay.useQuery().data;
    const teams = teamsQuery.data;
    const remarksByTeamQuery = api.judges.getRemarksByteam;
    const changeProgress = api.judges.changeTeamProgress.useMutation({
        onSuccess: async () => {
            await teamsQuery.refetch();
            toast.success("Team updated");
        }
    });
    return(
        <>
        {
            teamsQuery.status === "loading" && (
                            <div className="flex h-screen w-screen items-center justify-center">
                                <Spinner />
                            </div>
                        )
        }
            {
                teamsQuery.status === "success" && (
                <div className="flex w-full justify-center items-center">
                    <Carousel className="w-[80vw] m-auto flex justify-center items-center h-screen">
                    <CarouselContent>
                    {
                        teams?.map((team, index) => {
                            return(
                                <CarouselItem key={index}>
                                    <Card className="h-[80dvh]">
                                            <CardContent className="flex flex-col items-center justify-between h-full p-8">
                                                <div className="flex flex-col gap-5 justify-center items-center h-[40%] border-b w-full">
                                                    <h1 className="text-5xl font-bold border rounded-full w-20 text-center h-20 items-center flex justify-center">{team.teamNo}</h1>
                                                    <h1 className="text-5xl font-semibold">{team.name}</h1>
                                                    <h3 className="text-3xl">{team.ideaSubmission?.track.toUpperCase()}</h3>
                                                </div>

                                                <div className="w-full h-[60%] pt-4">
                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex flex-col w-full justify-center items-center h-full gap-6">
                                                            
                                                            <Button className={team.teamProgress === 'WINNER' ? 'bg-green-500 text-white hover:bg-green-500' : 'bg-white text-black'}
                                                                
                                                                onClick={async () => {
                                                                    await changeProgress.mutateAsync({
                                                                        teamId: team.id,
                                                                        progress: 'WINNER'
                                                                    });
                                                                }}
                                                            >
                                                                Winner
                                                            </Button>
                                                            <Button className={team.teamProgress === 'RUNNER' ? 'bg-green-500 text-white hover:bg-green-500' : 'bg-white text-black'}
                                                                onClick={async () => {
                                                                    await changeProgress.mutateAsync({
                                                                        teamId: team.id,
                                                                        progress: 'RUNNER'
                                                                    });
                                                                }}
                                                            >
                                                                Runner up
                                                            </Button>
                                                            <Button className={team.teamProgress === 'SECOND_RUNNER' ? 'bg-green-500 text-white hover:bg-green-500' : 'bg-white text-black'}
                                                                onClick={async () => {
                                                                    await changeProgress.mutateAsync({
                                                                        teamId: team.id,
                                                                        progress: 'SECOND_RUNNER'
                                                                    });
                                                                }}
                                                            >
                                                                Second Runner Up
                                                            </Button>
                                                            <Button className={team.teamProgress === 'TRACK' ? 'bg-green-500 text-white hover:bg-green-500' : 'bg-white text-black'}
                                                                onClick={async () => {
                                                                    await changeProgress.mutateAsync({
                                                                        teamId: team.id,
                                                                        progress: 'TRACK'
                                                                    });
                                                                }}
                                                            >
                                                                Track Winner
                                                            </Button>
                                                            <Button variant={'destructive'}
                                                                onClick={async () => {
                                                                    await changeProgress.mutateAsync({
                                                                        teamId: team.id,
                                                                        progress: 'TOP15'
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
                            )
                        })
                    }
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
                </div>
                )
            }
        </>
    )
}
