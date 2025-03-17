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
import type { Judge, User } from "@prisma/client";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useState } from "react";

interface TableProps {
  data: (Omit<Judge, 'User'> & { User: User })[] | null;
  refetch: () => void;
}

const JudgesTable: FunctionComponent<TableProps> = ({ data, refetch }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteJudge = api.organiser.removeJudge.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("Judge deleted");
      setDeletingId(null);
      refetch();
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(`Error deleting judge: ${error.message || "Unknown error"}`);
      setDeletingId(null);
    },
  });
  
  return (
    <div className="flex w-full items-center justify-center">
      <div className="h-full max-w-screen-2xl rounded-md border p-10">
        {!data ? (
          <Table>
            <TableBody>
              <TableRow>
                <Spinner size="large" />
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((judge) => {
                return (
                  <TableRow key={judge.User.id}>
                    <TableCell>{judge.User.name}</TableCell>
                    <TableCell>{judge.type}</TableCell>
                    <TableCell>
                      {judge.User.phone ?? judge.User.email}
                    </TableCell>
                    <TableCell>
                        <Button
                        onClick={() => {
                          toast.loading("Deleting judge...");
                          setDeletingId(judge.User.id);
                          deleteJudge.mutate({
                          userId: judge.User.id,
                          });
                        }}
                        disabled={deletingId === judge.User.id}
                        >
                        {deletingId === judge.User.id ? "Deleting..." : "Delete"}
                        </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        {data?.length === 0 && (
          <div className="flex w-full justify-center p-5">
            No Data To Display
          </div>
        )}
      </div>
    </div>
  );
};

export default JudgesTable;
