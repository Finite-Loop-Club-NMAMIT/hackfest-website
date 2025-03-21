/* eslint-disable @typescript-eslint/no-unused-vars */
import type { FunctionComponent } from "react";
import { useEffect, useState, useRef } from "react";
import { api } from "~/utils/api";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import JudgesTable from "./judgesTable";
import type { JudgeType, User } from "@prisma/client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ChevronDown } from "lucide-react";

interface Props {
  users: User[] | undefined;
}

const JudgePanel: FunctionComponent<Props> = ({ users }) => {
  const [judgeType, setJudgeType] = useState<JudgeType>("VALIDATOR");
  const [userQuery, setUserQuery] = useState<string>("");
  const [openUserList, setOpenUserList] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  
  const [selectedUsers, setSelectedUsers] = useState(users);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const { refetch: judgesRefetch } = api.organiser.getJudgesList.useQuery();

  const addJudge = api.organiser.addJudge.useMutation({
    onSuccess: async () => {
      toast.dismiss("addingJudge");
      toast.success("Judge added successfully");
      setOpen(false);
      setUserId(null);
      setUserName(null);
      await judgesRefetch();
    },
    onError: async () => {
      toast.dismiss();
      toast.error("Error adding judge");
    },
  });

  const form = useForm<{
    userId: string;
    type: JudgeType;
  }>({
    defaultValues: {
      userId: "",
      type: "DAY1",
    },
  });

  if (addJudge.isLoading) {
    toast.loading("Adding judge", { id: "addingJudge" });
  }

  async function submitForm() {
    if (!userId) return toast.error("Please select a user");

    await addJudge.mutateAsync({
      userId: userId,
      type: form.getValues().type,
    });
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

  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setOpenUserList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Judges Management</h2>
        <Dialog
          open={open}
          onOpenChange={(value) => {
            setOpen(value);
            if (!value) {
              setUserId(null);
              setUserName(null);
              setUserQuery("");
              form.reset();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>+ Add Judge</Button>
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
              <DialogTitle>Add Judge</DialogTitle>
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
                    <ChevronDown className={`ml-2 h-4 w-4 shrink-0 text-white opacity-50 transition-transform ${openUserList ? 'rotate-180' : ''}`} />
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
                                form.setValue("userId", user.id);
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
              
              <div className="flex flex-col gap-2">
                <label htmlFor="judge-type" className="text-sm font-medium text-white">
                  Judge Type
                </label>
                <Select
                  defaultValue={form.getValues().type}
                  onValueChange={(value) => {
                    form.setValue("type", value as JudgeType);
                    setJudgeType(value as JudgeType);
                  }}
                >
                  <SelectTrigger id="judge-type">
                    <SelectValue placeholder="Select judge type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAY1">Day 1</SelectItem>
                    <SelectItem value="DAY2">Day 2</SelectItem>
                    <SelectItem value="DAY3">Day 3</SelectItem>
                    <SelectItem value="VALIDATOR">Validator</SelectItem>
                    <SelectItem value="SUPER_VALIDATOR">Super Validator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={submitForm}>Add Judge</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="w-full overflow-x-auto">
        <div className="w-full">
          <JudgesTable />
        </div>
      </div>
    </>
  );
};

export default JudgePanel;
