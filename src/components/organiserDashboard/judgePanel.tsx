import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
} from "../ui/dialog";
import { FunctionComponent, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { api } from "~/utils/api";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { addJudgeZ } from "~/server/schema/zod-schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { toast } from "sonner";
import JudgesTable from "./judgesTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { JudgeType, Tracks, User } from "@prisma/client";
import { ScrollArea } from "../ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ChevronDown } from "lucide-react";

interface Props {
  users: User[] | undefined;
}

const JudgePanel: FunctionComponent<Props> = ({ users }) => {
  const [judgeType, setJudgeType] = useState<JudgeType>("VALIDATOR");
  const [userQuery, setUserQuery] = useState<string>("");
  const [openUserList, setOpenUserList] = useState<boolean>(false);

  const [selectedUsers, setSelectedUsers] = useState(users);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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
        <h1 className="py-10 text-center text-4xl font-bold">Judges</h1>
      </div>
      <Dialog>
        <DialogTrigger className="my-5 flex w-full items-center justify-center">
          <button className="rounded-lg bg-white px-4 py-2 text-black">
            + Add Judge
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>Add Judge</DialogHeader>
          <Form {...form}>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await form.handleSubmit(submitForm)();
              }}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => {
                  return (
                    <FormItem className="w-full">
                      <FormLabel>User Id/Name</FormLabel>
                      <FormControl>
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
                          <PopoverContent className="px-3">
                            <Input
                              placeholder="Enter User ID/Name"
                              className="text-white"
                              value={userQuery}
                              defaultValue={field.value}
                              onChange={(e) => {
                                setUserQuery(e.target.value);
                              }}
                            />
                            <ScrollArea className="h-72 pt-5">
                              <div className="group">
                                {selectedUsers?.length === 0 && (
                                  <div className="text-center text-gray-500">
                                    No users found
                                  </div>
                                )}
                                {selectedUsers?.map((user) => (
                                  <Button
                                    variant="ghost"
                                    className={`h-max w-full justify-start text-wrap text-start font-normal ${userId === user.id ? "bg-accent text-accent-foreground group-hover:bg-inherit group-hover:text-inherit group-hover:hover:bg-accent group-hover:hover:text-accent-foreground" : ""}`}
                                    key={user.id}
                                    onClick={(e) => {
                                      setUserId(user.id);
                                      form.setValue("userId", user.id);
                                      setUserName(user.name);
                                      setOpenUserList(false);
                                      setUserQuery("");
                                    }}
                                  >
                                    {user.name}
                                  </Button>
                                ))}
                              </div>
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              ></FormField>

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => {
                  return (
                    <FormItem className="w-full">
                      <FormLabel>Judge Type</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(e) => {
                            field.onChange(e);
                            setJudgeType(e as JudgeType);
                          }}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={field.value} />
                          </SelectTrigger>
                          <SelectContent>
                          <SelectItem value="DAY1">DAY1</SelectItem>
                          <SelectItem value="DAY2">DAY2</SelectItem>
                          <SelectItem value="DAY3">DAY3</SelectItem>

                            {/* <SelectItem value="VALIDATOR">Validator</SelectItem>
                            <SelectItem value="SUPER_VALIDATOR">
                              Super Validator
                            </SelectItem> */}
                           
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              ></FormField>

              {/* <FormField
                control={form.control}
                name="track"
                render={({ field }) => {
                  return (
                    <FormItem className="w-full">
                      <FormLabel>Tracks</FormLabel>
                      <FormControl>
                        <Select
                          disabled={judgeType === "VALIDATOR"}
                          onValueChange={field.onChange}
                          value={
                            judgeType !== "SUPER_VALIDATOR" && judgeType !== "VALIDATOR" 
                              ? "ALL"
                              : form.getValues().track
                          }
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={field.value} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">ALL</SelectItem>
                            <SelectItem value="FINTECH">FINTECH</SelectItem>
                            <SelectItem value="SUSTAINABLE_DEVELOPMENT">
                              SUSTAINABLE_DEVELOPMENT
                            </SelectItem>
                            <SelectItem value="HEALTHCARE">
                              HEALTHCARE
                            </SelectItem>
                            <SelectItem value="METAVERSE">METAVERSE</SelectItem>
                            <SelectItem value="LOGISTICS">LOGISTICS</SelectItem>
                            <SelectItem value="OPEN_INNOVATION">
                              OPEN_INNOVATION
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              ></FormField> */}

              <Button type="submit">Add Judge</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <JudgesTable data={judgesData} refetch={judgesRefetch} />
    </>
  );
};

export default JudgePanel;
