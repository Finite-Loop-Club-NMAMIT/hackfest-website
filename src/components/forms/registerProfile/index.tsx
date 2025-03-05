import React, { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateProfileZ } from "~/server/schema/zod-schema";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { type z } from "zod";
import { Courses, TshirtSize } from "@prisma/client";
import { cn } from "~/lib/utils";
import gsap from "gsap";
import { env } from "~/env";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import CreateCollegeForm from "../createCollege";
import DragAndDropFile from "~/components/ui/dragDrop";
import { LuChevronsUpDown } from "react-icons/lu";
import { FaCheck, FaInfoCircle } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import Link from "next/link";
import { useRouter } from "next/router";
import { useGSAP } from "@gsap/react";

export default function RegisterProfileForm() {
  const horizontalBar = useRef<HTMLDivElement>(null);
  const { data } = useSession();
  const router = useRouter();

  const colleges = api.college.getColleges.useQuery();
  const updateProfileMutaion = api.user.updateProfile.useMutation({
    onSuccess: () => {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("hackfestProfileData");
      }

      toast.dismiss("submitting");
      setSubmitting(false);
      setRegisterd(true);
      gsap.set("#form-title", { innerText: "Profile Registered" });
      toast.success("You have successfully registerd");
      setTimeout(() => {
        window.location.href = "/profile";
      }, 5000);
    },
    onError: () => {
      toast.dismiss("submitting");
      setSubmitting(false);
      toast.error("Failed to register");
    },
  });

  const [isCollegePopoverOpen, setCollegePopoverOpen] = useState(false);
  const [isCoursePopoverOpen, setCoursePopoverOpen] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [aadhaar, setAadhaar] = useState<File | null>(null);
  const [collegeId, setCollegeId] = useState<File | null>(null);
  const [aadhaarUrl, setAadhaarUrl] = useState("");
  const [collegeIdUrl, setCollegeIdUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registerd, setRegisterd] = useState(false);
  const [redirectingIn, setRedirectingIn] = useState(5);
  const [isGithubVerified, setGithubVerified] = useState(false);

  const form = useForm<z.infer<typeof updateProfileZ>>({
    resolver: zodResolver(updateProfileZ),
    defaultValues: {
      name: data?.user.name ?? "",
      phone: data?.user.phone ?? "",
      college: "",
      course: undefined,
      tshirtSize: undefined,
      aadhaarUrl: "",
      collegeIdUrl: "",
      github: "",
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = window.localStorage.getItem("hackfestProfileData");
      if (data) {
        const parsedData = JSON.parse(data) as z.infer<typeof updateProfileZ>;
        form.reset(parsedData);
        if (parsedData.college && parsedData.course && parsedData.tshirtSize) {
          setSelectedCollege(
            colleges.data?.find((college) => college.id === parsedData.college)
              ?.name ?? "",
          );
          setSelectedCourse(
            courses.find((course) => course.key === parsedData.course)?.name ??
              "",
          );
        }
      }
    }
  }, []);

  function onSubmit(values: z.infer<typeof updateProfileZ>) {
    updateProfileMutaion.mutate(values);
  }

  async function uploadFiles(file: File, setter: (url: string) => void) {
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
      return false;
    }
    setter(data.secure_url);

    return data.secure_url;
  }

  useEffect(() => {
    if (aadhaarUrl !== "") {
      form.setValue("aadhaarUrl", aadhaarUrl);
    }
    if (collegeIdUrl !== "") {
      form.setValue("collegeIdUrl", collegeIdUrl);
    }
  }, [aadhaarUrl, collegeIdUrl, form]);

  useGSAP(() => {
    if (horizontalBar.current ?? registerd) {
      gsap.fromTo(
        horizontalBar.current,
        { width: "100%" },
        { width: "0%", duration: 5 },
      );
    }
  }, [registerd]);

  useEffect(() => {
    if (registerd && redirectingIn > 0) {
      const interval = setInterval(() => {
        setRedirectingIn(redirectingIn - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [registerd, redirectingIn]);

  if (registerd) {
    return (
      <>
        <div
          ref={horizontalBar}
          className="mx-auto h-1 w-full bg-gradient-to-r from-transparent via-white to-transparent"
        ></div>
        <div className="mx-auto mt-6 w-full max-w-xl text-center">
          <p>
            Your profile has been registerd successfully 🎉. You can now join a
            team or create a new one
          </p>
          <div className="mt-6 flex w-full flex-row flex-nowrap justify-evenly">
            <Button
              variant="outline"
              className="bg-transparent/30"
              onClick={async () => {
                await router.push("/register", { query: { t: "join" } });
                router.reload();
              }}
            >
              Join Team
            </Button>
            <Button
              variant="outline"
              className="bg-transparent/30"
              onClick={async () => {
                await router.push("/register", { query: { t: "create" } });
                router.reload();
              }}
            >
              Create Team
            </Button>
          </div>
          <p className="mx-auto mt-4 text-sm opacity-50">
            Redirecting to{" "}
            <Link href={"/profile"} className="text-blue-500 underline">
              profile
            </Link>{" "}
            in {redirectingIn}
          </p>
        </div>
      </>
    );
  } else
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-4 flex h-full min-h-[32rem] flex-col gap-4 sm:min-h-[28rem]"
        >
          <div className="flex w-full flex-row justify-center">
            <div
              className={cn(
                "size-4 rounded-full",
                tab === 0
                  ? "bg-white/80"
                  : tab >= 1
                    ? "bg-green-600"
                    : "bg-white/30",
              )}
            ></div>
            <div className="my-auto h-1 w-6 bg-white/20"></div>
            <div
              className={cn(
                "size-4 rounded-full",
                tab === 1
                  ? "bg-white/80"
                  : tab === 2
                    ? "bg-green-600"
                    : "bg-white/30",
              )}
            ></div>
          </div>

          <div
            id="tab-1"
            className="flex h-full min-h-72 w-full flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name here" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="phone">Phone No.</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <p className="absolute left-4 top-[0.6rem] text-sm opacity-50">
                        +91
                      </p>
                      <Input className="pl-12" type="number" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="github"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="github">Github</FormLabel>
                  <FormControl>
                    <div className="flex flex-row gap-2">
                      <Input
                        placeholder="Username"
                        {...field}
                        disabled={isGithubVerified}
                      />
                      {isGithubVerified ? (
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            toast.info("Github username already verified");
                            e.stopPropagation();
                          }}
                          variant={"outline"}
                          className="border-green-500 bg-green-500/40"
                        >
                          <FaCircleCheck className="size-5" />
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          onClick={async (e) => {
                            e.preventDefault();
                            toast.loading("Verifying Github identity", {
                              id: "github",
                            });

                            const response = await fetch(
                              `https://api.github.com/users/${form.getValues("github")}`,
                            );
                            if (response.status === 404) {
                              toast.error("Github usename not found");
                            } else if (response.status === 200) {
                              toast.success("Github username verified");
                              setGithubVerified(true);
                            }

                            toast.dismiss("github");
                          }}
                        >
                          Verify
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="college"
              render={({}) => (
                <FormItem>
                  <FormLabel htmlFor="college">College</FormLabel>
                  <FormControl>
                    <Popover
                      open={isCollegePopoverOpen}
                      onOpenChange={setCollegePopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button className="w-full bg-background text-left text-white hover:bg-background">
                          <p className="mr-auto">
                            {selectedCollege === ""
                              ? "Select College"
                              : selectedCollege}
                          </p>
                          <LuChevronsUpDown />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-screen max-w-3xl border-none bg-transparent p-0 px-10">
                        <Command className="w-full border-2">
                          <CommandInput placeholder="Search College..." />
                          <CommandEmpty>
                            <p>College not found</p>
                            <Dialog
                              open={isDialogOpen}
                              onOpenChange={setDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <Button className="mt-4">Add college</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle className="text-center text-2xl">
                                    Add College
                                  </DialogTitle>
                                  <DialogDescription>
                                    <CreateCollegeForm
                                      closeDialog={() => {
                                        setDialogOpen(false);
                                      }}
                                      refetch={colleges.refetch}
                                    />
                                  </DialogDescription>
                                </DialogHeader>
                              </DialogContent>
                            </Dialog>
                          </CommandEmpty>
                          <CommandList>
                            <CommandGroup className="max-h-56 overflow-auto">
                              {colleges.data?.map((college) => {
                                return (
                                  <CommandItem
                                    key={college.id}
                                    value={college.name}
                                    onSelect={() => {
                                      form.setValue("college", college.id);
                                      setSelectedCollege(college.name);
                                      setCollegePopoverOpen(false);
                                    }}
                                    className={cn(
                                      "mt-1 flex flex-row flex-nowrap justify-between",
                                      form.getValues().college === college.id
                                        ? ""
                                        : "",
                                    )}
                                  >
                                    <p className="w-full text-wrap">
                                      {college.name}
                                    </p>
                                    {selectedCollege === college.name ? (
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

            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="course"
                render={({}) => (
                  <FormItem className="flex flex-col space-y-2">
                    <FormLabel htmlFor="name">Course</FormLabel>
                    <FormControl>
                      <Popover
                        open={isCoursePopoverOpen}
                        onOpenChange={setCoursePopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button className="max-w-56 bg-background text-left text-white hover:bg-background">
                            <p className="w-full">
                              {selectedCourse === ""
                                ? "Select course"
                                : selectedCourse}
                            </p>
                            <LuChevronsUpDown />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="max-w-56">
                          <ScrollArea>
                            {courses.map((course) => {
                              return (
                                <Button
                                  className="w-full bg-transparent text-left text-white hover:bg-[#1e293b]"
                                  key={course.key}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedCourse(course.name);
                                    form.setValue("course", course.key);
                                    setCoursePopoverOpen(false);
                                  }}
                                >
                                  <p className="w-full">{course.name}</p>
                                  {selectedCourse === course.name ? (
                                    <FaCheck className="ml-4 size-4" />
                                  ) : (
                                    <div className="ml-4 size-4"></div>
                                  )}
                                </Button>
                              );
                            })}
                          </ScrollArea>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tshirtSize"
                render={({}) => (
                  <FormItem className="mt-2 flex flex-col md:mt-0">
                    <FormLabel htmlFor="name">T-Shirt size</FormLabel>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      className="flex justify-start"
                      onValueChange={(value) => {
                        form.setValue("tshirtSize", value as TshirtSize);
                      }}
                    >
                      {shirtSizes.map((shirt) => {
                        return (
                          <ToggleGroupItem key={shirt.key} value={shirt.key}>
                            {shirt.name}
                          </ToggleGroupItem>
                        );
                      })}
                    </ToggleGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-row flex-nowrap justify-evenly pt-6">
              <Button
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedCollege("");
                  setSelectedCourse("");

                  form.reset({
                    name: "",
                    phone: "",
                    college: "",
                    course: undefined,
                    tshirtSize: undefined,
                    github: isGithubVerified ? form.getValues().github : "",
                  });
                }}
              >
                Clear
              </Button>

              <Button
                disabled={!isGithubVerified}
                variant="default"
                onClick={async (e) => {
                  e.preventDefault();

                  const [name, phone, college, course, tshirtSize, github] =
                    await Promise.all([
                      form.trigger("name"),
                      form.trigger("phone"),
                      form.trigger("college"),
                      form.trigger("course"),
                      form.trigger("tshirtSize"),
                      form.trigger("github"),
                    ]);

                  if (
                    !(
                      name &&
                      phone &&
                      college &&
                      course &&
                      tshirtSize &&
                      github
                    )
                  ) {
                    return;
                  } else {
                    if (typeof window !== "undefined") {
                      window.localStorage.setItem(
                        "hackfestProfileData",
                        JSON.stringify(form.getValues()),
                      );
                    }
                  }

                  setTab(1);
                  const tl = gsap.timeline();
                  tl.fromTo(
                    "#tab-1",
                    {
                      x: "0rem",
                      opacity: 1,
                      display: "flex",
                    },
                    {
                      x: "-2rem",
                      opacity: 0,
                      display: "none",
                      duration: 0.3,
                    },
                  );
                  tl.fromTo(
                    "#tab-2",
                    {
                      x: "2rem",
                      opacity: 0,
                      display: "none",
                    },
                    {
                      x: "0rem",
                      opacity: 1,
                      display: "flex",
                      duration: 0.3,
                    },
                  );
                  gsap.to("#form-title", { innerText: "Details Verification" });
                }}
              >
                Next
              </Button>
            </div>
          </div>

          <div
            id="tab-2"
            className="flex h-full flex-col"
            style={{ display: "none" }}
          >
            <div className="mt-6 flex h-[26rem] w-full flex-col gap-4 md:h-[23rem] md:flex-row">
              <DragAndDropFile
                accept="image/*"
                onChange={setAadhaar}
                text="Aadhaar"
              />
              <DragAndDropFile
                accept="image/*"
                onChange={setCollegeId}
                text="College ID"
              />
            </div>

            <div className="mt-6 flex w-full flex-nowrap items-center justify-center gap-2 text-white/50">
              <FaInfoCircle /> Drop image(jpg, png, jpeg) of size less than 2MB.
            </div>

            <div className="flex flex-row flex-nowrap justify-evenly pt-6">
              <Button
                disabled={submitting}
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  setTab(0);
                  const tl = gsap.timeline();
                  tl.fromTo(
                    "#tab-2",
                    {
                      x: "0rem",
                      opacity: 1,
                      display: "flex",
                    },
                    {
                      x: "2rem",
                      opacity: 0,
                      display: "none",
                      duration: 0.3,
                    },
                  );
                  tl.fromTo(
                    "#tab-1",
                    {
                      x: "-2rem",
                      opacity: 0,
                      display: "none",
                    },
                    {
                      x: "0rem",
                      opacity: 1,
                      display: "flex",
                      duration: 0.3,
                    },
                  );
                  gsap.to("#form-title", { innerText: "Personal Details" });
                }}
              >
                Previous
              </Button>
              <Button
                disabled={submitting}
                onClick={async (e) => {
                  e.preventDefault();

                  if (aadhaar && collegeId) {
                    const allowedTypes = [
                      "image/jpeg",
                      "image/png",
                      "image/jpg",
                    ];

                    if (
                      !allowedTypes.includes(aadhaar.type) ||
                      !allowedTypes.includes(collegeId.type)
                    ) {
                      toast.error("Only jpeg, jpg and png files are allowed");
                      return;
                    }

                    if (
                      aadhaar.size > 2 * 1000 * 1000 ||
                      collegeId.size > 2 * 1000 * 1000
                    ) {
                      toast.error("Uploads must be less than 2MB");
                      return;
                    }

                    setTab(2);
                    setSubmitting(true);
                    toast.loading("Saving Details...", {
                      id: "submitting",
                    });

                    try {
                      const result = await Promise.all([
                        uploadFiles(aadhaar, setAadhaarUrl),
                        uploadFiles(collegeId, setCollegeIdUrl),
                      ]);

                      if (result[0] === false || result[1] === false) {
                        toast.error("Error uploading files");
                        toast.dismiss("submitting");
                        setSubmitting(false);
                      } else {
                        // FIXME: This timeout allows to wait for the state to get updated
                        const timeout = setTimeout(() => {
                          void form.handleSubmit(onSubmit)();
                        }, 500);

                        return () => clearTimeout(timeout);
                        // await form.handleSubmit(onSubmit)();
                      }
                    } catch (error) {
                      toast.dismiss("submitting")
                      toast.error("Error Registering");
                      setSubmitting(false);
                    }
                  } else {
                    toast.error("Please upload both files");
                  }
                }}
              >
                Submit
              </Button>
            </div>
          </div>
        </form>
      </Form>
    );
}

const courses = [
  { name: "B.Tech", key: Courses.BTech },
  { name: "B.E", key: Courses.BE },
  { name: "B.Sc", key: Courses.BSc },
  { name: "BCA", key: Courses.BCA },
];

const shirtSizes = [
  { name: "S", key: TshirtSize.S },
  { name: "M", key: TshirtSize.M },
  { name: "L", key: TshirtSize.L },
  { name: "XL", key: TshirtSize.XL },
  { name: "XXL", key: TshirtSize.XXL },
];
