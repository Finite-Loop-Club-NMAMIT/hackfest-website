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

const VolunteersTable: FunctionComponent = () => {
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
  
  return (
    <div className="w-full">
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
