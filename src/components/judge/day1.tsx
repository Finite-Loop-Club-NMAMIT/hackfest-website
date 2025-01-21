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
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { set } from "zod";
  
export default function DAY1(){
    const { data, status } = useSession();
    const teamsQuery = api.judges.getTeams.useQuery();
    const judgeDay = api.judges.getDay.useQuery().data;
    const teams = teamsQuery.data;
    

    const setRemarkMutation = api.judges.addRemark.useMutation({
        onSuccess: async () => {
            await fetchedRemark.refetch();
            toast.success("Remark added successfully");
        }
    });
    const fetchedRemark = api.judges.getRemarkByJudge.useQuery();
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

                                                <div className="w-full flex-flex-col  h-[60%] pt-4 space-y-6">
                                                    <h3 className="text-3xl">Remarks</h3>
                                                    <Textarea  rows={3} defaultValue={remarks[index]?.remarks } onChange={(e) => {setUpdatedRemarks(e.target.value)}}/>
                                                    {
                                                        fetchedRemark.status === 'success' && fetchedRemark.data[index]?.remarks ? (
                                                            <Button
                                                                onClick={async () => {
                                                                       await handleUpdateRemark(remarks[index]!.id, updatedRemarks)
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