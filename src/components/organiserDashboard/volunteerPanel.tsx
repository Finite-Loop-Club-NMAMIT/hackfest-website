import { type FunctionComponent, useEffect, useState, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { api } from "~/utils/api";
import { toast } from "sonner";
import VolunteersTable from "./volunteerTable";
import type { User } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ChevronDown } from "lucide-react";

interface Props {
  users: User[] | undefined;
}

const VolunteerPanel: FunctionComponent<Props> = ({ users }) => {
  const [userQuery, setUserQuery] = useState<string>("");
  const [openUserList, setOpenUserList] = useState<boolean>(false);
  const [open, setOpen] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState(users);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const popupRef = useRef<HTMLDivElement>(null);

  const {refetch: volunteersRefetch } =
    api.organiser.getVolunteerList.useQuery();

  const addVolunteer = api.organiser.addVolunteer.useMutation({
    onSuccess: async () => {
      toast.dismiss("addingVolunteer");
      toast.success("Volunteer added successfully");
      setOpen(false);
      setUserId(null);
      setUserName(null);
      await volunteersRefetch();
    },
    onError: async () => {
      toast.dismiss();
      toast.error("Error adding volunteer");
    },
  });

  if(addVolunteer.isLoading){
    toast.loading("Adding Volunteer", {id:"addingVolunteer"});
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setOpenUserList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!users) return;
    setSelectedUsers(() => {
      return users.filter(
        (user) =>
          user.id.toLowerCase().includes(userQuery.toLocaleLowerCase()) ||
          user.name?.toLowerCase().includes(userQuery.toLowerCase()),
      );
    });
  }, [users, userQuery]);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Volunteers Management</h2>
        <Dialog
          open={open}
          onOpenChange={(value) => {
            setOpen(value);
            if (!value) {
              setUserId(null);
              setUserName(null);
              setUserQuery("");
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>+ Add Volunteer</Button>
          </DialogTrigger>
          <DialogContent
            onInteractOutside={(e) => {
              // Prevent dialog from closing when clicking popover
              if (openUserList) {
                e.preventDefault();
              }
            }}
            className="sm:max-w-md"
          >
            <DialogHeader>
              <DialogTitle>Add Volunteer</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="user-select" className="text-sm font-medium text-white">
                  Select User
                </label>
                <div className="relative" ref={popupRef}>
                  <Button
                    id="user-select"
                    variant="outline"
                    role="combobox"
                    onClick={() => setOpenUserList(!openUserList)}
                    className="w-full justify-between text-white"
                  >
                    {userName ? userName : "Select user"}
                    <ChevronDown className={`ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform ${openUserList ? 'rotate-180' : ''}`} />
                  </Button>
                  {openUserList && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95">
                      <div className="p-2">
                        <Input
                          placeholder="Search users..."
                          className="w-full text-white"
                          value={userQuery}
                          onChange={(e) => setUserQuery(e.target.value)}
                        />
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {selectedUsers?.length === 0 ? (
                          <div className="p-2 text-center text-sm text-white">
                            No users found
                          </div>
                        ) : (
                          selectedUsers?.map((user) => (
                            <button
                              key={user.id}
                              className={`w-full px-4 py-2 text-left text-white hover:bg-accent hover:text-accent-foreground ${
                                userId === user.id ? "bg-accent" : ""
                              }`}
                              onClick={() => {
                                setUserId(user.id);
                                setUserName(user.name);
                                setOpenUserList(false);
                                setUserQuery("");
                              }}
                            >
                              {user.name}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={async () => {
                  if (!userId) return toast.error("Please select a user");
                  await addVolunteer.mutateAsync({ id: userId });
                }}
              >
                Add Volunteer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="w-full overflow-x-auto">
        <div className="w-full">
          <VolunteersTable />
        </div>
      </div>
    </>
  );
};

export default VolunteerPanel;
