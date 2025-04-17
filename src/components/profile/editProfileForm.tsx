import { useState } from "react";
import { Button } from "../ui/button";
import { Courses, type College, type User } from "@prisma/client";
import { Card, CardContent } from "../ui/card";
import {
  BookText,
  Building2,
  ChevronDown,
  CircleUserRound,
  Loader2Icon,
  Mail,
  Phone,
  Save,
} from "lucide-react";
import { LogoutButton } from "./logout";
import { Dropzone } from "../ui/dropZone";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { toast } from "sonner";
import { Input } from "../ui/input";
import CreateCollege from "./createCollege";
import { ScrollArea } from "../ui/scroll-area";
import { api } from "~/utils/api";
import { type inferRouterOutputs } from "@trpc/server";
import { type collegeRouter } from "~/server/api/routers/college";
import { env } from "~/env";

export const EditProfileForm: React.FC<{
  user: User & {
    college: College | null;
  };
  colleges:
    | inferRouterOutputs<typeof collegeRouter>["getColleges"]
    | undefined
    | null;
  refetch: () => void;
  collegeRefetch: () => void;
}> = ({ user, colleges, refetch, collegeRefetch }) => {
  const [formData, setFormData] = useState({
    uname: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    state: user.college?.state ?? "",
    course: user.course ?? "",
    collegeName: user.college?.name ?? "",
    aadhaarImg: user.aadhaar ?? "",
    collegeIdImg: user.college_id ?? "",
    collegeId: user.college?.id ?? "",
  });

  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [clgFile, setClgFile] = useState<File | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [openCollegeList, setOpenCollegeList] = useState(false);
  const [openCourseList, setOpenCourseList] = useState(false);
  const [collegevalue, setCollegevalue] = useState("");
  const [coursevalue, setCoursevalue] = useState("");

  const courses: string[] = Object.entries(Courses).map(([, value]) => value);
  const editProfile = api.user.editProfile.useMutation({
    onMutate: () => {
      setIsSaving(true);
    },
    onSuccess: () => {
      setIsSaving(false);
      toast.success("Profile Updated");
      refetch();
    },
    onError: (error) => {
      setIsSaving(false);
      toast.error(error.message);
    },
  });

  const upload = async (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!file) return toast.error("No file uploaded");
    if (file.size > 2 * 1000 * 1000) {
      return toast.error("Uploads must be less than 2MB");
    }
    if (!allowedTypes.includes(file.type))
      return toast.error("Only jpeg, jpg and png files are allowed");
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
      toast.error("Error uploading image");
      //toast.dismiss(loadingToast);
      return;
    }
    return data.secure_url;
  };

  const something = async () => {
    console.log({ aadhaarFile, clgFile });
    if (user?.aadhaar && user?.college_id) {
      setFormData({ ...formData, aadhaarImg: user.aadhaar });
      setFormData({ ...formData, collegeIdImg: user.college_id });
      if (aadhaarFile) {
        //upload
		if(aadhaarFile.size > 2*1000*1000) return toast.error("Uploads must be less than 2Mb")
        toast.loading("Uploading Aadhaar...", {
          id: "aadhaar",
        });
        const newFile = await upload(aadhaarFile);
        setAadhaarFile(null);
        toast.dismiss("aadhaar");
        toast.success("Aadhaar uploaded");
        console.log(newFile);

        setFormData(prev=>{ return {...prev, aadhaarImg: newFile as string }});
      }
      if (clgFile) {
		if(clgFile.size > 2*1000*1000) return toast.error("Uploads must be less than 2Mb")
        toast.loading("Uploading College ID...", {
          id: "college",
        });
        const newFile = await upload(clgFile);
        setClgFile(null);
        toast.dismiss("college");
        toast.success("College ID uploaded");
        console.log(newFile);
        setFormData(prev=>{ return {...prev, collegeIdImg: newFile as string }});
      }
    } else {
      if (!aadhaarFile || !clgFile) {
        return toast.error("Please fill all details");
      }
      const aadhaarUrl = await upload(aadhaarFile);
      const collegeUrl = await upload(clgFile);
      setFormData({ ...formData, collegeIdImg: aadhaarUrl as string });
      setFormData({ ...formData, collegeIdImg: collegeUrl as string });

    }
  };

  const onSubmit = async () => {
    await editProfile
      .mutateAsync({
        aadhaarUrl: formData.aadhaarImg,
        collegeIdUrl: formData.collegeIdImg,
        college: formData.collegeId,
        name: formData.uname,
        phone: formData.phone,
        course: formData.course as Courses,
      })
      .catch((error) => {
        console.log(
          (
            error as {
              message: string;
            }
          ).message,
        );
      });
    // if (res.status == "error") throw new Error(res.message);
    // if (res.status == "success" || res.status == "success") return res.message;
  };

  return (
    <>
      <Card className="w-full" suppressHydrationWarning>
        <CardContent className="p-4">
          <p className="mb-1 mt-3 block text-sm font-medium text-gray-900 dark:text-white">
            Name :
          </p>
          <div className="flex">
            <span className="rounded-e-0 inline-flex items-center rounded-s-md border border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
              <CircleUserRound size={20} />
            </span>
            <Input
              id="name"
              value={formData.uname}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  uname: e.target.value,
                })
              }
              type="text"
              className="rounded-none rounded-r-lg"
              placeholder="Name"
            />
          </div>

          <p className="mb-1 mt-3 block text-sm font-medium text-gray-900 dark:text-white">
            Personal Email :
          </p>
          <div className="flex">
            <span className="rounded-e-0 inline-flex items-center rounded-s-md border border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
              <Mail size={20} />
            </span>
            <input
              readOnly
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
              type="text"
              className="block w-full min-w-0 flex-1 cursor-default rounded-none rounded-e-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="Email not found"
            />
          </div>
          <p className="mb-1 mt-3 block text-sm font-medium text-gray-900 dark:text-white">
            Phone number :
          </p>
          <div className="flex">
            <span className="rounded-e-0 inline-flex items-center rounded-s-md border border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
              <Phone size={20} />
            </span>
            <Input
              type="number"
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value,
                })
              }
              maxLength={10}
              className="rounded-none rounded-r-lg"
            />
          </div>

          <p className="mb-1 mt-3 block text-sm font-medium text-gray-900 dark:text-white">
            Course :
          </p>
          <div className="flex">
            <span className="rounded-e-0 inline-flex items-center rounded-s-md border border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
              <BookText size={20} />
            </span>
            <Popover open={openCourseList} onOpenChange={setOpenCourseList}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCourseList}
                  className="w-full justify-between rounded-none rounded-r-lg"
                >
                  {coursevalue
                    ? coursevalue
                    : formData.course
                      ? formData.course
                      : "Select course"}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[100%] max-w-xs px-3 md:w-screen md:max-w-md lg:max-w-lg">
                <Command>
                  <CommandInput
                    placeholder="Search course here..."
                    className="h-9"
                  />
                  <CommandEmpty>
                    Only Bachelor Degrees in Engineering are allowed.
                  </CommandEmpty>
                  <CommandGroup>
                    {courses.map((course) => (
                      <CommandItem
                        key={course}
                        value={course}
                        onSelect={(currentValue) => {
                          setCoursevalue(
                            currentValue === coursevalue ? "" : course,
                          );
                          setFormData({
                            ...formData,
                            course: course,
                          });
                          setOpenCourseList(false);
                        }}
                      >
                        {course}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <p className="mb-1 mt-3 block text-sm font-medium text-gray-900 dark:text-white">
            College :
          </p>
          <div className="flex">
            <span className="rounded-e-0 inline-flex items-center rounded-s-md border border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
              <Building2 size={20} />
            </span>
            <Popover open={openCollegeList} onOpenChange={setOpenCollegeList}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCollegeList}
                  className="w-full justify-between overflow-hidden rounded-none rounded-r-lg"
                >
                  {collegevalue
                    ? collegevalue
                    : formData.collegeName
                      ? formData.collegeName +
                        ", " +
                        formData.state
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
              <PopoverContent className="w-[100%] max-w-xs px-3 md:w-screen md:max-w-md lg:max-w-lg">
                <Command>
                  <CommandInput
                    placeholder="Search college here..."
                    className="h-9"
                  />
                  <CommandEmpty className="mt-3 flex flex-col items-center justify-center text-center">
                    No College with that name found.
                    <CreateCollege refetchColleges={collegeRefetch} />
                  </CommandEmpty>
                  <CommandGroup>
                    <ScrollArea className="h-72">
                      {colleges?.map((college) => (
                        <CommandItem
                          key={college.id}
                          value={college.name + ", " + college.state}
                          onSelect={(currentValue) => {
                            setCollegevalue(
                              currentValue === collegevalue
                                ? ""
                                : college.name +
                                    ", " +
                                    college.state
                                      .replace(/_/g, " ")
                                      .split(" ")
                                      .map(
                                        (word) =>
                                          word.charAt(0).toUpperCase() +
                                          word.slice(1).toLowerCase(),
                                      )
                                      .join(" "),
                            );
                            setFormData({
                              ...formData,
                              collegeId: college.id,
                            });
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
                      <CreateCollege refetchColleges={collegeRefetch} />
                    </ScrollArea>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardContent className="grid gap-2 p-4 md:grid-cols-1 lg:grid-cols-2">
          <div className="sm:py-2">
            <p className="my-2 block text-sm font-medium text-gray-900 dark:text-white">
              Aadhaar :
            </p>
            <Dropzone
              onChange={setAadhaarFile}
              className="w-full"
              fileExtension="images"
              image={formData.aadhaarImg.split(";")[0]}
            />
          </div>
          <div className="sm:py-2">
            <p className="my-2 block text-sm font-medium text-gray-900 dark:text-white">
              College ID :
            </p>
            <Dropzone
              onChange={setClgFile}
              className="w-full"
              fileExtension="images"
              image={formData.collegeIdImg.split(";")[0]}
            />
          </div>
        </CardContent>
      </Card>
      <div className="mt-5 flex w-full items-center justify-center gap-5">
        <Button
          onClick={async (e) => {
            e.preventDefault();
            await something();
			await onSubmit();
          }}
          disabled={isSaving}
          className={`${
            isSaving ? "cursor-not-allowed" : ""
          } flex items-center gap-2`}
        >
          {isSaving ? (
            <Loader2Icon size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Save profile
        </Button>
        <LogoutButton />
      </div>
    </>
  );
};
