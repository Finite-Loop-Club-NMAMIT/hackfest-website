import type { FunctionComponent } from "react";
import {
  TableCell,
  TableHead,
  TableRow,
  Table,
  TableBody,
  TableHeader,
} from "~/components/ui/table";
import Spinner from "../spinner";
import { api } from "~/utils/api";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useState } from "react";


const JudgesTable: FunctionComponent = () => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, refetch } = api.organiser.getJudgesList.useQuery();

  const deleteJudge = api.organiser.removeJudge.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("Judge deleted");
      setDeletingId(null);
      void refetch();
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(`Error deleting judge: ${error.message || "Unknown error"}`);
      setDeletingId(null);
    },
  });
  
  return (
    <div className="w-full">
      {!data ? (
        <div className="flex justify-center py-8">
          <Spinner size="large" />
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Name</TableHead>
                <TableHead className="w-1/4">Role</TableHead>
                <TableHead className="w-1/4">Contact</TableHead>
                <TableHead className="w-1/4">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((judge) => {
                return (
                  <TableRow key={judge.id}>
                    <TableCell>{judge.User[0]?.name}</TableCell>
                    <TableCell>{judge.type}</TableCell>
                    <TableCell>
                      {judge.User[0]?.phone ?? judge.User[0]?.email}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => {
                          if (!judge.User[0]?.id) return;
                          toast.loading("Deleting judge...");
                          setDeletingId(judge.id);
                          deleteJudge.mutate({
                            userId: judge.User[0].id,
                            judgeId: judge.id,
                          });
                        }}
                        disabled={deletingId === judge.User[0]?.id}
                      >
                        {deletingId === judge.User[0]?.id ? "Deleting..." : "Delete"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No judges found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default JudgesTable;
