import { zodResolver } from "@hookform/resolvers/zod";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { createCollegeZ } from "~/server/schema/zod-schema";
import { states } from "./states";
import { api } from "~/utils/api";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { LuChevronsUpDown } from "react-icons/lu";
import { FaCheck } from "react-icons/fa";
import { toast } from "sonner";

export default function CreateCollegeForm({ closeDialog, refetch }: { closeDialog: () => void; refetch: () => void }) {
  const [selectedState, setSelectedState] = useState("");
  const [ isPopoverOpen, setPopoverOpen ] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const createCollegeMutation = api.college.createCollege.useMutation({
    onSuccess: () => {
      closeDialog();
      refetch();
      toast.success("College created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<z.infer<typeof createCollegeZ>>({
    resolver: zodResolver(createCollegeZ),
    defaultValues: {
      name: "",
      state: "",
    },
  });

  function onSubmit(values: z.infer<typeof createCollegeZ>) {
    createCollegeMutation.mutate(values);
  }

  return (
    <div>
      <Form {...form}>
        <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">College Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="University of Full time coders"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({}) => (
              <FormItem>
                <FormLabel className="text-lg">State</FormLabel>
                <FormControl>
                  <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button className="w-full border-[1px] bg-background text-left text-white hover:bg-background">
                        <p className="mr-auto">
                          {selectedState === ""
                            ? "Select State"
                            : selectedState}
                        </p>
                        <LuChevronsUpDown />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-screen border-none bg-transparent p-6 py-1">
                      <Command className="mx-auto max-w-96 border-2 p-2">
                        <CommandInput placeholder="Search State" />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup className="max-h-48 overflow-auto">
                            {states.map((state) => {
                              return (
                                <CommandItem
                                  key={state.key}
                                  value={state.name}
                                  onSelect={() => {
                                    form.setValue("state", state.key);
                                    setSelectedState(state.name);
                                    setPopoverOpen(false);
                                  }}
                                >
                                  <p className="w-full text-wrap">
                                    {state.name}
                                  </p>
                                  {selectedState === state.name ? (
                                    <FaCheck className="ml-4 size-4" />
                                  ) : (
                                    <div className="ml-4 size-4"></div>
                                  )}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button onClick={async(e) => {
            e.preventDefault();
            await form.handleSubmit(onSubmit)();
          }}>Submit</Button>
        </form>
      </Form>
    </div>
  );
}
