import { Tracks } from "@prisma/client";
import { useContext, useEffect, useState } from "react";
import { ProgressContext } from "../../progressProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, type z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
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
import { useSession } from "next-auth/react";
import { submitIdeaZ } from "~/server/schema/zod-schema";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { env } from "~/env";

export default function IdeaSubmitForm({ refetch }: { refetch: () => void }) {
  const { currentState, setCurrentState, setMaxState } =
    useContext(ProgressContext);
  const form = useForm<z.infer<typeof submitIdeaZ>>({
    resolver: zodResolver(submitIdeaZ),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [wordLimit, setWordLimit] = useState(0);
  const submitIdea = api.idea.submitIdea.useMutation();

  const upload = async (file: File) => {
    const allowedTypes = ["application/pdf"];
    if (!file) return toast.error("No file uploaded");
    if (file.size > 5 * 1000 * 1000) {
      return toast.error("Uploads must be less than 5MB");
    }
    if (!allowedTypes.includes(file.type))
      return toast.error("Only pdf files are allowed");
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
    if (!data.secure_url) {
      toast.error("Error uploading PDF");
      return;
    }
    return data.secure_url;
  };

  const something = async () => {
    if (pdf) {
      toast.loading("Uploading PDF...", {
        id: "PDF",
      });
      const newFile = await upload(pdf);
      toast.dismiss("PDF");
      toast.success("PDF uploaded");
      setPdf(null);
      console.log(newFile);

      form.setValue("pptUrl", newFile as string);
    }
    await form.handleSubmit(onSubmit)();
  };

  const onSubmit = async (data: z.infer<typeof submitIdeaZ>) => {
    setLoading(true);
    await submitIdea
      .mutateAsync(
        {
          pptUrl: data.pptUrl,
          problemStatement: data.problemStatement,
          track: data.track as Tracks,
          referralCode: data.referralCode,
        },
        {
          onSuccess: () => {
            toast.success("Idea Submitted");
            setLoading(false);
            setCurrentState(3);
            setMaxState(3);
            refetch();
          },
          onError: (error) => {
            toast.error(error.message);
            setLoading(false);
            setError(error.message);
          },
        },
      )
      .catch((e) => {
        console.log(e);
        setLoading(false);
      });
  };

  const user = useSession();

  useEffect(() => {
    if (error) setTimeout(() => setError(""), 2000);
  }, [error]);

  if (currentState !== 2) return null;

  return (
    <div className={`relative max-h-max w-full `}>
      {!user.data?.user.isLeader && (
        <div className="absolute inset-0 z-50 flex h-full w-full items-center justify-center text-center text-2xl text-white opacity-100 md:text-3xl">
          {user.status === "loading"
            ? "Loading..."
            : "Waiting for team leader to submit the Idea..."}
        </div>
      )}
      <Form {...form}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await something();
          }}
          className={`flex flex-col gap-2 md:gap-4 ${
            !user.data?.user.isLeader ? "pointer-events-none opacity-30" : ""
          }`}
        >
          <h1 className="text-center text-xl lg:text-2xl ">Submit Idea</h1>
          <p
            className={`text-center ${
              error.includes("updated") ? "text-green-500" : "text-red-500"
            }`}
          >
            {error}
          </p>

          <div className="mx-auto flex flex-col flex-wrap items-center justify-center gap-4 md:flex-row">
            {/* Name */}
            <FormField
              control={form.control}
              name="problemStatement"
              render={({ field }) => {
                return (
                  <FormItem className="w-[92%]">
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

            {/* Phone */}
            <FormField
              control={form.control}
              name="referralCode"
              render={({ field }) => (
                <FormItem className="w-full md:w-[45%]">
                  <FormLabel className="">Referral Code (Optional)</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Referral Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>

            {/* list of tracks*/}
            <FormField
              control={form.control}
              name="track"
              render={({ field }) => (
                <FormItem className="w-full md:w-[45%]">
                  <FormLabel className="">Track</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Track" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.values(Tracks).map((name, key) => (
                            <SelectItem
                              value={name}
                              key={key}
                              className="capitalize"
                            >
                              {name.replaceAll("_", " ").toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>

            <div className="flex w-full flex-col items-center justify-center gap-5">
              <FormField
                control={form.control}
                name="pptUrl"
                render={({}) => (
                  <FormItem className="mx-auto w-[92%]">
                    <FormLabel className="flex items-center justify-between">
                      Idea PPT
                      <a
                        href="/idea_template.pptx"
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
                  href="/idea_template.pptx"
                  download
                  className="cursor-pointer text-xs underline"
                >
                  PPT Template
                </a>{" "}
                for your submission; only submissions using this template will
                be accepted.
              </p>
              <Button type="submit" className="w-fit">
                {loading ? "Submitting.." : "Submit"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
