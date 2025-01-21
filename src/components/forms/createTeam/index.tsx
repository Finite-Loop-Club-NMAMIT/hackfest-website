import { useContext, useEffect, useState } from "react";
import { ProgressContext } from "../../progressProvider";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Loader2Icon, UserRoundPlus } from "lucide-react";
import { Input } from "../../ui/input";
import { api } from "~/utils/api";
import { toast } from "sonner";

export default function CreateTeam({ refetch }: { refetch: () => void }) {
  const { currentState } = useContext(ProgressContext);

  const [teamId, setTeamId] = useState("");
  const [Error, setError] = useState("");
  const [Message, setMessage] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [Loading1, setLoading1] = useState(false);
  const [Loading2, setLoading2] = useState(false);
  const [teamName, setTeamName] = useState("");
  const createTeam = api.team.createTeam.useMutation({
    onSuccess: () => {
      setMessage("Team created successfully");
      refetch();
    },
    onError: (error) => {
      console.log(error);
      setError(error.message);
    },
  });
  const joinTeam = api.team.joinTeam.useMutation({
    onSuccess: () => {
      setMessage("Team joined successfully");
      refetch();
    },
    onError: (error) => {
      console.log(error.message);
      setError(error.message);
    },
  });

  useEffect(() => {
    if (isWaiting) setTimeout(() => setIsWaiting(false), 200);
  }, [isWaiting]);

  // const nameHandler = async (name: string) => {
  //   setTeamName(name);
  //   if (!isWaiting && name.length > 3) {
  //     const res = checkName.data;
  //     if (
  //       res?.status === "success" &&
  //       (res?.message === true || res?.message === false)
  //     ) {
  //       console.log(res?.message);
  //       setIsNameAvailable(res?.message);
  //     } else {
  //       setError(res?.message as string);
  //     }
  //   } else setIsNameAvailable(false);
  // };

  useEffect(() => {
    if (Error) setTimeout(() => setError(""), 2000);
    if (Message) setTimeout(() => setMessage(""), 2000);
  }, [Error, Message]);

  if (currentState !== 1) return null;

  return (
    <Card className="h-fit w-full">
      <CardHeader>
        <CardTitle className="text-center">Team management</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <div className="m-auto flex flex-col justify-evenly rounded-lg">
          <div className="flex w-full justify-center">
            {(Error || Message) && (
              <Badge
                className={`-mt-2 w-fit text-center ${
                  !Error ? "text-green-500" : "text-red-500"
                }`}
              >
                {Error || Message}
              </Badge>
            )}
          </div>

          <div className="my-4 flex flex-col items-center justify-center gap-3 lg:flex-row">
            <Card className="w-full p-5">
              <CardContent>
                <form
                  className="flex flex-col gap-2 text-center"
                  onSubmit={async (e) => {
                    setLoading1(true);
                    e.preventDefault();
                    if (teamName.length > 10) {
                      setLoading1(false);
                      return toast.error(
                        "Team name should be less than 10 characters",
                      );
                    }
                    toast.promise(
                      createTeam.mutateAsync({
                        teamName,
                      }),
                      {
                        loading: "Creating team...",
                        success: "Team created successfully",
                        error(error) {
                          return (error as { message: string }).message;
                        },
                      },
                    );

                    // if (res.status === "error") setError(res.message);
                    // if (res.status === "success") {
                    //   setMessage(res.message);
                    // }
                    setLoading1(false);
                  }}
                >
                  <h1 className="text-xl font-bold">Create a Team</h1>

                  <Input
                    onChange={(e) => setTeamName(e.target.value)}
                    type="text"
                    placeholder="Team Name"
                    className={`rounded border p-2 text-center text-white`}
                    name="teamname"
                    required
                  />
                  <Button type="submit" className={`flex items-center gap-2`}>
                    {Loading1 ? (
                      <>
                        <Loader2Icon size={16} className="animate-spin" />
                      </>
                    ) : (
                      <>
                        <UserRoundPlus size={16} />
                        Create Team
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="w-full p-5">
              <CardContent>
                <form
                  className="flex flex-col gap-2 text-center"
                  onSubmit={async (e) => {
                    setLoading2(true);
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    toast.promise(
                      joinTeam.mutateAsync({
                        teamId: formData.get("teamid") as string,
                      }),
                      {
                        loading: "Joining team...",
                        success: "Team joined successfully",
                        error(error) {
                          return (error as { message: string }).message;
                        },
                      },
                    );
                    // if (res.status === "error") setError(res.message);
                    // if (res.status === "success") setMessage(res.message);
                    setLoading2(false);
                  }}
                >
                  <h1 className="text-xl font-bold">Join a Team</h1>
                  <Input
                    onChange={(e) => setTeamId(e.target.value)}
                    value={teamId}
                    type="text"
                    className="rounded border p-2"
                    placeholder="Team ID"
                    name="teamid"
                    required
                  />
                  <Button type="submit" className="flex items-center gap-2">
                    {Loading2 ? (
                      <>
                        <Loader2Icon size={16} className="animate-spin" />
                      </>
                    ) : (
                      <>
                        <UserRoundPlus size={16} />
                        Join Team
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
