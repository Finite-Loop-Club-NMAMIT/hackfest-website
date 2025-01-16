import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { createTeamZ } from "~/server/schema/zod-schema";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import { api } from "~/utils/api";
import { Loader } from "lucide-react";

export default function RegisterTeamForm() {
  const params = useSearchParams();
  const utils = api.useUtils();
  const [isTeamNameUnique, setIsTeamNameUnique] = useState<
    "loading" | "inuse" | "available" | null
  >(null);
  const [teamTimeout, setTeamTimeout] = useState<NodeJS.Timeout>();
  const createTeamForm = useForm<z.infer<typeof createTeamZ>>({
    resolver: zodResolver(createTeamZ),
    defaultValues: {
      teamName: "",
    },
  });

  function onSubmit(values: z.infer<typeof createTeamZ>) {
    console.log(values);
  }

  // useEffect(() => {
  //   const teamName = createTeamForm.getValues("teamName");
  //   let timeout: NodeJS.Timeout;
  //   if (teamName.length > 0) {
  //     timeout = setTimeout(() => {
  //       // const data = api.team.checkName.useQuery({ teamName: teamName }).data;
  //       // console.log(data);
  //     });
  //   }

  //   return () => {
  //     clearTimeout(timeout);
  //   };
  // }, []);

  function checkIsTeamNameUnique(event: React.ChangeEvent<HTMLInputElement>) {
    const teamName = event.currentTarget.value;
    if (teamName.length > 0) {
      setIsTeamNameUnique("loading");
      if (teamTimeout) {
        clearTimeout(teamTimeout);
      }
      const timeout = setTimeout(() => {
        void utils.team.checkName
          .fetch({ teamName: teamName })
          .then((response) => {
            console.log(response);
            setIsTeamNameUnique(response.message ? "available" : "inuse");
          });
      }, 1000);

      setTeamTimeout(timeout);
    } else {
      setIsTeamNameUnique(null);
    }
  }

  return (
    <Tabs
      defaultValue={params.get("t") ?? "create"}
      className="mx-auto flex w-full max-w-3xl flex-col justify-center"
    >
      <TabsList
        className="mx-auto mt-8 w-full max-w-lg"
        onValueChange={(value) => {
          params.set("t", value);
        }}
      >
        <TabsTrigger value="create" className="w-full">
          Create
        </TabsTrigger>
        <TabsTrigger value="join" className="w-full">
          Join
        </TabsTrigger>
      </TabsList>
      <TabsContent value="create" className="mt-4">
        <Form {...createTeamForm}>
          <form
            onSubmit={createTeamForm.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <FormField
              control={createTeamForm.control}
              name="teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter team name here"
                      {...field}
                      onInput={checkIsTeamNameUnique}
                    />
                  </FormControl>
                  <div className="flex flex-row items-center gap-2 opacity-60">
                    <span className="loader size-4 text-[1px]"></span>{" "}
                    <p>Checking for team name availability</p>
                  </div>
                  {isTeamNameUnique === "loading" && (
                    <div className="flex flex-row items-center gap-2 opacity-60">
                      <span className="loader size-4 text-[1px]"></span>{" "}
                      <p>Checking for team name availability</p>
                    </div>
                  )}
                  {isTeamNameUnique === "available" && <div>available</div>}
                  {isTeamNameUnique === "inuse" && <div>inuse</div>}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </TabsContent>
      <TabsContent value="join" className="mt-4">
        Change your password here.
      </TabsContent>
    </Tabs>
  );
}
