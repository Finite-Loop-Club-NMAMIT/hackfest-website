import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
  } from "../ui/dialog";
  import { type FunctionComponent, useEffect, useState } from "react";
  import { Button } from "../ui/button";
  import { api } from "~/utils/api";
  import { toast } from "sonner";
  import VolunteersTable from "./volunteerTable";
  import type { User } from "@prisma/client";
  import { Popover, PopoverTrigger } from "../ui/popover";
  import { ChevronDown } from "lucide-react";
  
  interface Props {
    users: User[] | undefined;
  }
  
  const VolunteerPanel: FunctionComponent<Props> = ({ users }) => {
    const [userQuery, setUserQuery] = useState<string>("");
    const [openUserList, setOpenUserList] = useState<boolean>(false);
  
    const [selectedUsers, setSelectedUsers] = useState(users);
    const [userName, setUserName] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [open, setOpen] = useState(false); // Add this state to control the main dialog
  
    const { data: volunteersData, refetch: volunteersRefetch } =
      api.organiser.getVolunteerList.useQuery();
  
    const addVolunteer = api.organiser.addVolunteer.useMutation({
      onSuccess: async () => {
        toast.dismiss("addingVolunteer")
        toast.success("Added Volunteer")
        setOpen(false); // Close the dialog on success
        setUserId(null); // Reset the selected user
        setUserName(null);
        await volunteersRefetch();
      },
      onError: async () => {
        toast.dismiss();
        toast.error("Error adding volunteer");
      },
    });
  
    
  if(addVolunteer.isLoading){
    toast.loading("Adding Volunteer",{id:"addingVolunteer"});

  }
    
  
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
        <div className="w-full border-b">
          <h1 className="py-10 text-center text-4xl font-bold">Volunteers</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="my-5 flex w-full items-center justify-center">
            <button className="rounded-lg bg-white px-4 py-2 text-black">
              + Add Volunteer
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>Add Volunteer</DialogHeader>
            <Popover
                            open={openUserList}
                            onOpenChange={setOpenUserList}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openUserList}
                                className="w-full justify-between overflow-hidden truncate dark:text-white"
                              >
                                {userName ? userName : "Select user"}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <div 
                              className={`absolute top-full left-0 mt-1 w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 shadow-lg z-50 ${!openUserList ? 'hidden' : ''}`}
                            >
                              <div className="p-3">
                                <input
                                  placeholder="Enter User ID/Name"
                                  className="w-full border dark:border-gray-600 rounded p-2 text-black dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={userQuery}
                                  onChange={(e) => {
                                    setUserQuery(e.target.value);
                                  }}
                                />
                              </div>
                              <div className="max-h-72 overflow-y-auto pt-2 px-3 pb-3">
                                <div className="group">
                                  {selectedUsers?.length === 0 && (
                                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                      No users found
                                    </div>
                                  )}
                                  {selectedUsers?.map((user) => (
                                    <button
                                      className={`h-max w-full text-left px-3 py-2 rounded-md mb-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                        userId === user.id 
                                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
                                          : "text-gray-800 dark:text-gray-200"
                                      }`}
                                      key={user.id}
                                      onClick={(_e) => {
                                        setUserId(user.id);
                                        setUserName(user.name);
                                        setOpenUserList(false);
                                        setUserQuery("");
                                      }}
                                    >
                                      {user.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </Popover>
                          <Button onClick={async () => {await addVolunteer.mutateAsync({
                            id: userId ? userId : ''
                          })}} >
                            Submit
                          </Button>
          </DialogContent>
        </Dialog>
        <VolunteersTable data={volunteersData} refetch={volunteersRefetch} />
      </>
    );
  };
  
  export default VolunteerPanel;
