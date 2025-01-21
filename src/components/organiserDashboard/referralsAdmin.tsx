import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
} from "../ui/dialog";
import { useState } from "react";
import { Button } from "../ui/button";
import { api } from "~/utils/api";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { addReferralCodeZ } from "~/server/schema/zod-schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import ReferralsTable from "./referralsTable";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ChevronDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import CreateCollege from "../profile/createCollege";
import { ScrollArea } from "../ui/scroll-area";

export default function ReferralsAdmin() {
  const addReferral = api.referrals.addReferralCode.useMutation();
  const [collegeId, setCollegeId] = useState("");

  const [openCollegeList, setOpenCollegeList] = useState(false);
  const [collegevalue, setCollegevalue] = useState("");
  const user = api.user.getUserWithCollege.useQuery().data;
  const { data: colleges, refetch: refetchColleges } =
    api.college.getColleges.useQuery();

  const { data: referrals, refetch: reffaralsRefetch } =
    api.referrals.getAllReferrals.useQuery();

  const form = useForm<z.infer<typeof addReferralCodeZ>>({
    defaultValues: {
      code: "HF2024_000",
      collegeId: "",
      contact: "",
      name: "",
      referrer: "",
    },
  });

  async function submitForm(data: z.infer<typeof addReferralCodeZ>) {
    if (
      !z
        .string()
        .email()
        .or(z.string().regex(/^\d{10}$/))
        .safeParse(data.contact).success
    )
      return toast.error("Enter a valid email or phone");

    if (collegeId.length === 0) return toast.error("Please choose a college");

    toast.loading("Adding referral");

    await addReferral.mutateAsync({
      code: data.code,
      collegeId: data.collegeId,
      contact: data.contact,
      name: data.name,
      referrer: data.referrer,
    });
    await reffaralsRefetch();
    toast.dismiss();
    toast.success("Added referral successfully");
  }

  return (
    <>
      <div className="w-full border-b">
        <h1 className="py-10 text-center text-4xl font-bold">Referrals</h1>
      </div>
      <Dialog>
        <DialogTrigger className="my-5 flex w-full items-center justify-center">
          <button className="rounded-lg bg-white px-4 py-2 text-black">
            + Add Referral Code
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>Add Referral Code</DialogHeader>
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
                name="referrer"
                render={({ field }) => {
                  return (
                    <FormItem className="w-full">
                      <FormLabel>Club Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Club Name"
                          className="text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              ></FormField>

              <FormField
                control={form.control}
                name="collegeId"
                render={({}) => (
                  <FormItem className="w-[80vw] md:w-[45%]">
                    <FormLabel>College</FormLabel>
                    <FormControl>
                      <Popover
                        open={openCollegeList}
                        onOpenChange={setOpenCollegeList}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCollegeList}
                            className="w-full justify-between overflow-hidden truncate text-white"
                          >
                            {collegevalue
                              ? collegevalue
                              : user?.college?.name
                                ? user?.college?.name +
                                  ", " +
                                  user?.college.state
                                    .replace(/_/g, " ")
                                    .split(" ")
                                    .map(
                                      (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1).toLowerCase(),
                                    )
                                    .join(" ")
                                : "Select college"}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="px-3">
                          <Command>
                            <CommandInput
                              placeholder="Search college here..."
                              className="h-9"
                            />
                            <CommandEmpty className="mt-3 flex flex-col items-center justify-center text-center">
                              No College with that name found.
                              <CreateCollege
                                refetchColleges={refetchColleges}
                              />
                            </CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="h-72">
                                {colleges?.map((college) => (
                                  <CommandItem
                                    key={college.id}
                                    value={college.id}
                                    onSelect={(currentValue) => {
                                      setCollegeId(college.id);
                                      form.setValue("collegeId", college.id);
                                      setCollegevalue(
                                        currentValue === collegevalue
                                          ? collegevalue
                                          : college.name +
                                              ", " +
                                              college.state
                                                .replace(/_/g, " ")
                                                .split(" ")
                                                .map(
                                                  (word) =>
                                                    word
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                    word.slice(1).toLowerCase(),
                                                )
                                                .join(" "),
                                      );
                                      // setFormData({
                                      //   ...formData,
                                      //   collegeId: college.id,
                                      // });
                                      setOpenCollegeList(false);
                                    }}
                                  >
                                    {college.name},{" "}
                                    {college.state
                                      .replace(/_/g, " ")
                                      .split(" ")
                                      .map(
                                        (word) =>
                                          word.charAt(0).toUpperCase() +
                                          word.slice(1).toLowerCase(),
                                      )
                                      .join(" ")}
                                  </CommandItem>
                                ))}
                                <CreateCollege
                                  refetchColleges={refetchColleges}
                                />
                              </ScrollArea>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => {
                  return (
                    <FormItem className="w-full">
                      <FormLabel>Referrer Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Refferer Name"
                          className="text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              ></FormField>

              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => {
                  return (
                    <FormItem className="w-full">
                      <FormLabel>Contact</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter contact"
                          className="text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              ></FormField>
              <Button type="submit">Add Referrer</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <ReferralsTable data={referrals} />
    </>
  );
}
