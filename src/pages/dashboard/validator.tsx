import {
  TableHeader,
  TableRow,
  Table,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import { api } from "~/utils/api";
import DashboardLayout from "~/components/layout/dashboardLayout";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import PDFModal from "~/components/validatorDashboard/pdfModal";
import Spinner from "~/components/spinner";
import NotFound from "../404";
import { Button } from "~/components/ui/button";

export default function Validator() {
  const submitScore = api.validator.setScore.useMutation({
    onSuccess: async () => {
      toast.dismiss("submitting-score");
      toast.success("Score submitted");
      await teamData.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const teamData = api.team.getTeamsList.useQuery();
  const user = useSession();

  if (submitScore.isLoading) {
    toast.loading("Submitting score", { id: "submitting-score" });
  }
  const { data, status } = useSession();

  if (status === "loading")
    return (
      <DashboardLayout>
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner />
        </div>
      </DashboardLayout>
    );

  if (
    !data ||
    !data.user ||
    (data.user.role !== "VALIDATOR" && data.user.role !== "ADMIN")
  ) {
    return <NotFound />;
  }

  return (
    !teamData.isLoading && (
      <DashboardLayout>
        <div className="flex w-full flex-col items-center justify-center gap-6 py-4">
          <h1 className="text-3xl font-semibold md:text-5xl">
            Validator Dashboard
          </h1>
          <div className="flex w-full flex-col items-center justify-center gap-y-2">
            <span className="text-xl">
              Hey there {user?.data?.user.name} 👋
            </span>
            <ul className="flex list-disc flex-col text-base text-slate-500">
              <li>You can cahnge your scores for a team</li>
              <li>Once you submit score for a team, the button turns green</li>
            </ul>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sl. No.</TableHead>
                <TableHead>Team Name</TableHead>
                <TableHead>PPT</TableHead>
                <TableHead></TableHead>
                <TableHead>Scores</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamData.data
                ?.filter((team) => (team.ideaSubmission ? true : false))
                .map((team, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>
                        {/* <PDFModal team={team}/> */}
                        <a
                          href={team.ideaSubmission?.pptUrl.split(";")[0]}
                          target="_blank"
                        >
                          <Button>View PDF</Button>
                        </a>
                      </TableCell>
                      <TableCell>
                        <button
                          className={`${team?.Scores[0]?.userId === user?.data?.user.id && team?.Scores[0]?.score.score === "5" ? "bg-green-700 text-white" : "bg-white text-black"} rounded-lg px-4 py-2`}
                          onClick={async () => {
                            await submitScore.mutateAsync({
                              teamId: team.id,
                              score: "5",
                            });
                          }}
                        >
                          Good
                        </button>
                      </TableCell>

                      <TableCell>
                        <button
                          className={`${team?.Scores[0]?.userId === user?.data?.user.id && team?.Scores[0]?.score.score === "10" ? "bg-green-700 text-white" : "bg-white text-black"} rounded-lg px-4 py-2`}
                          onClick={async () => {
                            await submitScore.mutateAsync({
                              teamId: team.id,
                              score: "10",
                            });
                          }}
                        >
                          Better
                        </button>
                      </TableCell>

                      <TableCell>
                        <button
                          className={`${team?.Scores[0]?.userId === user?.data?.user.id && team?.Scores[0]?.score.score === "15" ? "bg-green-700 text-white" : "bg-white text-black"} rounded-lg px-4 py-2`}
                          onClick={async () => {
                            await submitScore.mutateAsync({
                              teamId: team.id,
                              score: "15",
                            });
                          }}
                        >
                          Best
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </DashboardLayout>
    )
  );
}
