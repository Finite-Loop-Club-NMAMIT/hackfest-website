import { FunctionComponent } from "react";
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
import { JudgeType, Judges, Tracks, User } from "@prisma/client";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface TableProps {
  data:
    | ({
        User: User;
      } & {
        id: number;
        userId: string;
        track: Tracks;
        type: JudgeType;
      })[]
    | undefined;
  refetch: () => void;
}

const JudgesTable: FunctionComponent<TableProps> = ({ data, refetch }) => {
  const deleteJudge = api.organiser.removeJudge.useMutation({
    onSuccess: async () => {
      toast.dismiss();
      toast.success("Judge deleted");
      refetch();
    },
    onError: async () => {
      toast.error("Error adding judge");
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
                <TableHead>Track</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((judge) => {
                return (
                  <TableRow key={judge.id}>
                    <TableCell>{judge.User.name}</TableCell>
                    <TableCell>{judge.type}</TableCell>
                    <TableCell>{judge.track}</TableCell>
                    <TableCell>
                      {judge.User.phone ?? judge.User.email}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => {
                          toast.loading("Deleting judge...");
                          deleteJudge.mutate({
                            userId: judge.userId,
                          });
                        }}
                      >
                        Delete
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
