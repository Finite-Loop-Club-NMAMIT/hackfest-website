import { Tracks } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { useSession } from "next-auth/react";
import { submitIdeaZ } from "~/server/schema/zod-schema";
import { api } from "~/utils/api";
import { env } from "~/env";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Dropzone } from "../../ui/dropZone";
import { templateURL } from "~/components/registrationProgress";
import { toast } from "sonner";

export default function IdeaSubmitForm() {
  const { update } = useSession();

  const form = useForm<z.infer<typeof submitIdeaZ>>({
    resolver: zodResolver(submitIdeaZ),
  });

  const [submitting, setSubmitting] = useState(false);
  const [pdf, setPdf] = useState<File | null>(null);
  const [wordLimit, setWordLimit] = useState(0);
  const submitIdea = api.idea.submitIdea.useMutation({
    onSuccess: async() => {
      toast.dismiss("idea");
      toast.success("Idea Submitted Successfully");
      await update()
    },
    onError: (error) => {
      setSubmitting(false);
      toast.dismiss("idea");
      toast.error(error.message)
    }
  });

  const upload = async (file: File) => {
    const allowedTypes = ["application/pdf"];

    if (file.size > 5 * 1000 * 1000) {
      return toast.error("Uploads must be less than 5MB");
    }
    if (!allowedTypes.includes(file.type))
      return toast.error("Only pdf files are allowed");

    toast.loading("Uploading PDF...", {
      id: "PDF",
    });
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(
      `${env.NEXT_PUBLIC_BASE_URL}/api/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = (await response.json()) as { secure_url: string };
    toast.dismiss("PDF");
    if (!data.secure_url) {
      toast.error("Error uploading PDF");
      return;
    }
    return data.secure_url;
  };

  async function uploadPdf() {
    if (!pdf) {
      toast.error("No file uploaded");
      return false;
    } else {
      const secure_url = await upload(pdf);
      if (secure_url) {
        form.setValue("pptUrl", secure_url as string);
        return true;
      }else{
        return false;
      }
    }
  }

  const onSubmit = async (data: z.infer<typeof submitIdeaZ>) => {
    submitIdea.mutate(data);
  };

  const user = useSession();

  return (
    <div
      className={`relative max-h-max w-full max-w-7xl rounded-md bg-black/50 p-4 border mt-8 border-white/20`}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={`flex flex-col gap-2 md:gap-4 ${
            !user.data?.user.isLeader ? "pointer-events-none opacity-30" : ""
          }`}
        >
          <h1 className="gradient-text my-4 text-center text-3xl font-bold md:text-5xl">
            Submit Idea
          </h1>

          <div className="mx-auto flex flex-col flex-wrap items-center justify-center gap-4 md:flex-row">
            {/* Problem Statement */}
            <FormField
              control={form.control}
              name="problemStatement"
              render={({ field }) => {
                return (
                  <FormItem className="w-full">
                    <FormLabel className="flex items-center justify-between">
                      Problem Statement
                      <span
                        className={`${
                          wordLimit > 100 ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {wordLimit} / 100 characters
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your problem statement"
                        onChange={(e) => {
                          field.value = e.target.value;
                          field.onChange(e.target.value);
                          setWordLimit(e.target.value.length);
                        }}
                        value={field.value}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            ></FormField>

            {/* list of tracks*/}
            <FormField
              control={form.control}
              name="track"
              render={({ field }) => (
                <FormItem className="w-full max-w-2xl">
                  <FormLabel className="">Track</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Track" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.values(Tracks).map((name, key) => {
                            if (name !== "ALL") {
                              return (
                                <SelectItem
                                  value={name}
                                  key={key}
                                  className="capitalize"
                                >
                                  {name.replaceAll("_", " ").toLowerCase()}
                                </SelectItem>
                              );
                            }
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>

            {/* PPT */}
            <div className="flex w-full flex-col items-center justify-center gap-5">
              <FormField
                control={form.control}
                name="pptUrl"
                render={({}) => (
                  <FormItem className="mx-auto w-full max-w-4xl">
                    <FormLabel className="flex items-center justify-between">
                      Idea PPT
                      <a
                        href={templateURL}
                        download
                        className="cursor-pointer text-xs underline"
                      >
                        Download PPT Template
                      </a>
                    </FormLabel>
                    <FormControl>
                      <Dropzone
                        pdf
                        onChange={setPdf}
                        className="w-full"
                        fileExtension="pdf"
                      />
                    </FormControl>
                  </FormItem>
                )}
              ></FormField>
              <p className="text-center text-xs">
                Please download our provided{" "}
                <a
                  href={templateURL}
                  download
                  className="cursor-pointer text-xs underline"
                >
                  PPT Template
                </a>{" "}
                for your submission, only submissions using this template will
                be accepted.
              </p>

              {submitting ? (
                <Button disabled={submitting}>Submitting</Button>
              ) : (
                <Button
                  className="w-fit"
                  onClick={async (e) => {
                    e.preventDefault();
                    await form.trigger(["problemStatement", "track"]);

                    if(form.formState.errors.problemStatement ?? form.formState.errors.track) {
                      return;
                    }else{
                      setSubmitting(true);
                      const isUploaded = await uploadPdf();
                      if(isUploaded){
                        toast.loading("Submitting Idea",{
                          id: "idea"
                        });
                        await form.handleSubmit(onSubmit)();
                      }else{
                        setSubmitting(false);
                      }
                    }
                  }}
                >
                  Submit
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
