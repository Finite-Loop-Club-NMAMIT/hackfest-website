import type { FunctionComponent } from "react";
import {
  TableCell,
  TableHead,
  TableRow,
  Table,
  TableBody,
  TableHeader,
} from "~/components/ui/table";
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

const VolunteersTable: FunctionComponent = () => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data, refetch } = api.organiser.getVolunteerList.useQuery();

  const deleteVolunteer = api.organiser.removeVolunteer.useMutation({
    onSuccess: async () => {
      toast.dismiss();
      toast.success("Volunteer deleted");
      void refetch();
    },
    onError: async () => {
      toast.error("Error adding Volunteer");
    },
  });

  const handleDeleteClick = (userId: string) => {
    setSelectedUserId(userId);
    setConfirmDialogOpen(true);
    setConfirmText("");
  };

  const handleConfirmDelete = () => {
    if (!selectedUserId) return;
    if (confirmText !== "CONFIRM") {
      toast.error("Please type CONFIRM to delete");
      return;
    }

    toast.loading("Deleting volunteer...");
    deleteVolunteer.mutate({
      userId: selectedUserId,
    });
    setConfirmDialogOpen(false);
    setConfirmText("");
    setSelectedUserId(null);
  };

  return (
    <div className="w-full">
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <p className="text-white">Type CONFIRM to delete this volunteer</p>
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
          Loading...
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
              {data.map((volunteer) => {
                return (
                  <TableRow key={volunteer.id}>
                    <TableCell>{volunteer.name}</TableCell>
                    <TableCell>{volunteer.role}</TableCell>
                    <TableCell>
                      {volunteer.phone ?? volunteer.email}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleDeleteClick(volunteer.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No volunteers found
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

export default VolunteersTable;
