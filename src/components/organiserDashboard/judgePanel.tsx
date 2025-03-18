/* eslint-disable @typescript-eslint/no-unused-vars */
import type { FunctionComponent } from "react";
import { useEffect, useState, useRef } from "react";
import { api } from "~/utils/api";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { type addJudgeZ } from "~/server/schema/zod-schema";
import { toast } from "sonner";
import JudgesTable from "./judgesTable";
import type { Judge, JudgeType, User } from "@prisma/client";

interface Props {
  users: User[] | undefined;
}

const JudgePanel: FunctionComponent<Props> = ({ users }) => {
  const [judgeType, setJudgeType] = useState<JudgeType>("VALIDATOR");
  const [userQuery, setUserQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  
  const [selectedUsers, setSelectedUsers] = useState(users);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const { data: judgesData, refetch: judgesRefetch } =
    api.organiser.getJudgesList.useQuery();

  const addJudge = api.organiser.addJudge.useMutation({
    onSuccess: async () => {
      await judgesRefetch();
    },
    onError: async () => {
      toast.dismiss();
      toast.error("Error adding judge");
    },
  });

  const form = useForm<z.infer<typeof addJudgeZ>>({
    defaultValues: {
      userId: "",
      track: "ALL",
      type: "DAY1",
    },
  });

  async function submitForm(data: z.infer<typeof addJudgeZ>) {
    if (!form.getValues().userId) return toast.error("Please select a user");

    toast.loading("Adding judge");
    await addJudge.mutateAsync({
      userId: data.userId,
      type: data.type,
      track: data.type !== "VALIDATOR" ? "ALL" : data.track,
    });
    await judgesRefetch();
    toast.dismiss();
    toast.success("Added judge successfully");
    setIsModalOpen(false);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  return (
    <>
      <div className="w-full border-b">
        <h1 className="py-10 text-center text-4xl font-bold">Judges</h1>
      </div>
      
      <div className="my-5 flex w-full items-center justify-center">
        <button 
          className="rounded-lg bg-white px-4 py-2 text-black"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Judge
        </button>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div 
            ref={modalRef}
            className="w-full max-w-md rounded-lg bg-background p-6"
          >
            <div className="mb-4 flex justify-between">
              <h2 className="text-xl font-bold">Add Judge</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>
            
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await form.handleSubmit(submitForm)();
              }}
              className="flex flex-col gap-4"
            >
              {/* User Selection */}
              <div className="w-full">
                <label className="mb-2 block text-sm font-medium">User Id/Name</label>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex w-full justify-between rounded-md border border-gray-300 bg-transparent px-4 py-2 text-left focus:border-blue-500 focus:outline-none"
                  >
                    <span className="block truncate">{userName ? userName : "Select user"}</span>
                    <span className="pointer-events-none">▼</span>
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 max-h-96 w-full overflow-auto rounded-md border border-gray-300 bg-background shadow-lg">
                      <div className="p-2">
                        <input
                          type="text"
                          placeholder="Enter User ID/Name"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                          value={userQuery}
                          onChange={(e) => setUserQuery(e.target.value)}
                          autoFocus
                        />
                      </div>
                      
                      <div className="max-h-72 overflow-y-auto">
                        {selectedUsers?.length === 0 && (
                          <div className="px-3 py-2 text-center text-gray-500">
                            No users found
                          </div>
                        )}
                        {selectedUsers?.map((user) => (
                          <div
                            key={user.id}
                            className={`cursor-pointer px-3 py-2 hover:bg-gray-100 ${
                              userId === user.id ? "bg-gray-200" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setUserId(user.id);
                              form.setValue("userId", user.id);
                              setUserName(user.name);
                              setTimeout(() => {
                                setIsDropdownOpen(false);
                                setUserQuery("");
                              }, 100);
                            }}
                          >
                            {user.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {form.formState.errors.userId && (
                  <p className="mt-1 text-sm text-red-500">{form.formState.errors.userId.message}</p>
                )}
              </div>

              {/* Judge Type Selection */}
              <div className="w-full">
                <label className="mb-2 block text-sm font-medium">Judge Type</label>
                <select
                  className="w-full rounded-md bg-transparent px-3 py-2 focus:border-blue-500 focus:outline-none"
                  value={form.watch("type")}
                  onChange={(e) => {
                    const value = e.target.value as JudgeType;
                    form.setValue("type", value);
                    setJudgeType(value);
                  }}
                >
                  <option className="bg-black/50 text-white" value="DAY1">DAY1</option>
                  <option className="bg-black/50 text-white" value="DAY2">DAY2</option>
                  <option className="bg-black/50 text-white" value="DAY3">DAY3</option>
                  <option className="bg-black/50 text-white" value="VALIDATOR">Validator</option>
                  <option className="bg-black/50 text-white" value="SUPER_VALIDATOR">Super Validator</option>
                </select>
                {form.formState.errors.type && (
                  <p className="mt-1 text-sm text-red-500">{form.formState.errors.type.message}</p>
                )}
              </div>

              <button 
                type="submit"
                className="mt-4 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              >
                Add Judge
              </button>
            </form>
          </div>
        </div>
      )}
      
      <JudgesTable 
        data={judgesData as unknown as (Omit<Judge, 'User'> & { User: User })[] | null} 
        refetch={judgesRefetch} 
      />
    </>
  );
};

export default JudgePanel;
