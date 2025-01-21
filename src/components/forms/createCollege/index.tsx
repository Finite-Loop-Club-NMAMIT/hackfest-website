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
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function CreateCollegeForm({
  closeDialog,
  refetch,
}: {
  closeDialog: () => void;
  refetch: () => void;
}) {
  const [selectedState, setSelectedState] = useState("");
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const commandRef = useRef<HTMLDivElement>(null);

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

  useGSAP(() => {
    if (commandRef.current) {
      if (isCommandOpen) {
        gsap.to(commandRef.current, {
          height: 200,
          duration: 0.3,
          border: "1px solid #162031",
        });
      } else {
        gsap.to(commandRef.current, {
          height: 0,
          duration: 0.3,
          border: "none",
        });
      }
    }
  }, [isCommandOpen]);

  return (
    <div>
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-4 space-y-8 text-left"
        >
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
                  <>
                    <Button
                      className="w-full border-[1px] bg-background text-left text-white hover:bg-background"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsCommandOpen(!isCommandOpen);
                      }}
                    >
                      <p className="mr-auto">
                        {selectedState === "" ? "Select State" : selectedState}
                      </p>
                      <LuChevronsUpDown />
                    </Button>

                    <Command ref={commandRef} style={{ height: 0 }}>
                      <CommandInput placeholder="Enter state" />
                      <CommandEmpty>State not found</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {states.map((state) => {
                            return (
                              <CommandItem
                                className="text-left"
                                key={state.key}
                                value={state.name}
                                onSelect={() => {
                                  form.setValue("state", state.key);
                                  setSelectedState(state.name);
                                  setIsCommandOpen(false);
                                }}
                              >
                                <p className="w-full text-wrap">{state.name}</p>
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
                  </>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="w-full flex justify-end">
            <Button
              className=""
              onClick={async (e) => {
                e.preventDefault();
                await form.handleSubmit(onSubmit)();
              }}
            >
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
