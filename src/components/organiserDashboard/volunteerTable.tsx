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
import type { User } from "@prisma/client";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface TableProps {
  data: User[] | undefined;
  refetch: () => void;
}

const VolunteersTable: FunctionComponent<TableProps> = ({ data, refetch }) => {
  const deleteVolunteer = api.organiser.removeVolunteer.useMutation({
    onSuccess: async () => {
      toast.dismiss();
      toast.success("Volunteer deleted");
      refetch();
    },
    onError: async () => {
      toast.error("Error adding Volunteer");
    },
  });
  return (
    <div className="flex w-full items-center justify-center">
      <div className="h-full max-w-screen-2xl rounded-md border p-10">
        {!data ? (
          <Table>
            <TableBody>
              <TableRow>
                No data to display
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
                        onClick={() => {
                          toast.loading("Deleting volunteer...");
                          deleteVolunteer.mutate({
                            userId: volunteer.id,
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

export default VolunteersTable;
