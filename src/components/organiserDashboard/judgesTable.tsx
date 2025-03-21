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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";

const JudgesTable: FunctionComponent = () => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [selectedJudge, setSelectedJudge] = useState<{ id: string; userId: string } | null>(null);

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

  const handleDeleteClick = (judgeId: string, userId: string) => {
    setSelectedJudge({ id: judgeId, userId });
    setConfirmDialogOpen(true);
    setConfirmText("");
  };

  const handleConfirmDelete = () => {
    if (!selectedJudge) return;
    if (confirmText !== "CONFIRM") {
      toast.error("Please type CONFIRM to delete");
      return;
    }

    setDeletingId(selectedJudge.userId);
    deleteJudge.mutate({
      userId: selectedJudge.userId,
      judgeId: selectedJudge.id,
    });
    setConfirmDialogOpen(false);
    setConfirmText("");
    setSelectedJudge(null);
  };

  return (
    <div className="w-full">
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <p className="text-white">Type CONFIRM to delete this judge</p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type CONFIRM"
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button className="text-white" variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                          handleDeleteClick(judge.id, judge.User[0].id);
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
