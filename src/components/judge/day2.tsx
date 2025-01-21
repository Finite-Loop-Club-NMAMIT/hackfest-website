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
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import TeamRemarks from "./teamRemarks";
  
export default function DAY2(){
    const { data, status } = useSession();
    const teamsQuery = api.judges.getTeams.useQuery();
    const judgeDay = api.judges.getDay.useQuery().data;
    const teams = teamsQuery.data;
    const criterias = api.criteria.getCriteria.useQuery({
        type: 'JUDGE'
    }).data;
    const updateScore = api.judges.setScore.useMutation();
    const fetchedRemark = api.judges.getRemarkByJudge.useQuery();
    const setRemarkMutation = api.judges.addRemark.useMutation({
        onSuccess: async () => {
            await fetchedRemark.refetch();
            toast.success("Remark added successfully");
        }
    });

    const [remarks, setRemarks] = useState<{
        id: number;
        teamId: string;
        remarks: string;
        judgesId: number;   
    }[]>([]);

    const [updatedRemarks, setUpdatedRemarks] = useState<string>("");
    useEffect(() => {
        if(fetchedRemark.status === "success"){
            setRemarks(fetchedRemark.data);
        }
    },[fetchedRemark.status])

    const updateRemark = api.judges.updateRemark.useMutation({
        onSuccess: async () => {
            await fetchedRemark.refetch();
            toast.success("Remark updated successfully");
        }
    });

    const handleAddRemark = async (teamId:string, remark:string) => {
        await setRemarkMutation.mutateAsync({
            teamid: teamId,
            remark: remark
        });
    }

    const handleUpdateRemark = async (remarkId:number, remark:string) => {
        await updateRemark.mutateAsync({
            remarkId: remarkId,
            remark: remark
        });
    }
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

                                                <div className="w-full flex items-center justify-center  h-[60%] pt-8">
                                                    <div className="flex flex-col gap-4 justify-center items-center">
                                                        <h3 className="text-3xl">Score</h3>
                                                        <div className="flex flex-col w-full justify-center items-center h-full gap-6">
                                                        {
                                                            criterias?.map((criteria, index) => {
                                                                if(criteria.name !== 'top100'){
                                                                    return(
                                                                        <div className="grid grid-cols-2 gap-4" key={index}>
                                                                            <span>{criteria.name}</span>
                                                                            <input
                                                                                onBlur={async (e) => {
                                                                                    if (e.target.value)
                                                                                    await updateScore.mutateAsync({
                                                                                        teamId: team.id,
                                                                                        criteriaId: criteria.id,
                                                                                        score: Number(e.target.value),
                                                                                    });
                                                                                }}
                                                                                defaultValue={team?.Scores.find(teamScore => teamScore.score.criteriaId === criteria.id)?.score.score ?? ""}
                                                                                type="number"
                                                                                name="score"
                                                                                id="score"
                                                                                className="  rounded-md h-8 w-12 border-gray-300 text-center text-gray-700 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                                                            />
                                                                        </div>
                                                                    )
                                                                }
                                                            })
                                                        }
                                                        </div>
                                                    </div>

                                                    {/* <div className="pl-8 overflow-y-auto">
                                                        <div className="flex justify-between items-center w-full">
                                                            <h3 className="text-3xl">Remarks</h3>
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button size={'sm'}>
                                                                        Add Remark
                                                                    </Button>
                                                                </DialogTrigger>

                                                                <DialogContent>
                                                                <div className="w-full flex-flex-col  h-[60%] space-y-6 text-white">
                                                                    <h3 className="text-3xl">Remarks</h3>
                                                                    <Textarea  rows={10} defaultValue={remarks[index]?.remarks } onChange={(e) => {setUpdatedRemarks(e.target.value)}} />
                                                                    {
                                                                        fetchedRemark.status === 'success' && fetchedRemark.data[index]?.remarks ? (
                                                                            <Button
                                                                                onClick={async () => {
                                                                                    await handleUpdateRemark(remarks[index]!.id , updatedRemarks)
                                                                                }}
                                                                            >
                                                                                Update Remark
                                                                            </Button>
                                                                        ): (
                                                                            <Button
                                                                                onClick={async () => {
                                                                                    await handleAddRemark(team.id, updatedRemarks)
                                                                                }}
                                                                            >
                                                                                Add Remark
                                                                            </Button>
                                                                        )
                                                                    }
                                                                </div>
                                                                </DialogContent>
                                                            </Dialog>                                                            
                                                        </div>
                                                        <div className="flex flex-col gap-4 pt-6">
                                                           <TeamRemarks teamId={team.id} judgeDay={judgeDay!.type}/>
                                                        </div>

                                                    </div> */}
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