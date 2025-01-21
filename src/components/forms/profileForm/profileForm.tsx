import { TshirtSize } from "@prisma/client";
import { type Dispatch, useContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { getUrlAndId } from "~/utils/helper";
import { ProgressContext } from "../../progressProvider";
import { toast } from "sonner";
import { ChevronDown, Loader2Icon, Save } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Dropzone } from "../../ui/dropZone";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../../ui/command";
import CreateCollege from "../../profile/createCollege";
import { ScrollArea } from "../../ui/scroll-area";
import { updateProfileZ } from "~/server/schema/zod-schema";
import { api } from "~/utils/api";
import { type inferRouterOutputs } from "@trpc/server";
import { type userRouter } from "~/server/api/routers/user";
import { type collegeRouter } from "~/server/api/routers/college";
import { env } from "~/env";

const ProfileForm = ({
  user,
  colleges,
  courses,
  registerProp,
  refetch,
  refetchColleges,
}: {
  user:
    | inferRouterOutputs<typeof userRouter>["getUserWithCollege"]
    | null
    | undefined;
  colleges:
    | inferRouterOutputs<typeof collegeRouter>["getColleges"]
    | undefined
    | null;
  courses: string[];
  registerProp?: {
    currentState: number;
    maxState: number;
    setCurrentState: Dispatch<number>;
    setMaxState: Dispatch<number>;
  };
  refetch: () => void;
  refetchColleges: () => void;
}) => {
  const { currentState, maxState, setCurrentState, setMaxState } =
    useContext(ProgressContext);

  const form = useForm<z.infer<typeof updateProfileZ>>({
    resolver: zodResolver(updateProfileZ),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      college: user?.collegeId ?? "",
      course: user?.course ?? undefined,
      tshirtSize: user?.tShirtSize ?? undefined,
    },
  });
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [clgFile, setClgFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string>("");

  const [openCollegeList, setOpenCollegeList] = useState(false);
  const [collegevalue, setCollegevalue] = useState("");
  const [collegeId, setCollegeId] = useState(user?.collegeId ?? "");

  
  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile Updated");
      setLoading(false);
      refetch();
      if (registerProp) setCurrentState(1);
      if (maxState <= 1 && registerProp) setMaxState(1);
    },
    onError: (error) => {
      toast.error(error.message);
      setError(error.message);
      setLoading(false);
    },
  });

  const [collegeSearchQuery, setCollegeSearchQuery] = useState("");
  const [selectedColleges, setSelectedColleges] = useState(colleges);

  useEffect(() => {
    setSelectedColleges(
      colleges?.filter(
        (college) =>
          college.name
            .toLowerCase()
            .includes(collegeSearchQuery.toLowerCase()) ||
          college.state
            .toLowerCase()
            .includes(collegeSearchQuery.toLowerCase()),
      ),
    );
  }, [colleges, collegeSearchQuery]);
  
  if (currentState !== 0 && registerProp) {
    return <></>;
  }

  

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
      form.setValue("aadhaarUrl", user.aadhaar);
      form.setValue("collegeIdUrl", user.college_id);
      if (aadhaarFile) {
        //upload
        toast.loading("Uploading Aadhaar...", {
          id: "aadhaar",
        });
        const newFile = await upload(aadhaarFile);
        setAadhaarFile(null);
        toast.dismiss("aadhaar");
        toast.success("Aadhaar uploaded");
        console.log(newFile);

        form.setValue("aadhaarUrl", newFile as string);
      }
      if (clgFile) {
        toast.loading("Uploading College ID...", {
          id: "college",
        });
        const newFile = await upload(clgFile);
        setClgFile(null);
        toast.dismiss("college");
        toast.success("College ID uploaded");
        console.log(newFile);
        form.setValue("collegeIdUrl", newFile as string);
      }
      form
        .handleSubmit(onSubmit)()
        .catch((error) => {
          console.log(error);
        });
    } else {
      if (!aadhaarFile || !clgFile) {
        return toast.error("Please fill all details");
      }
      toast.loading("Uploading Aadhaar...", {
        id: "aadhaar",
      });
      const aadhaarUrl = await upload(aadhaarFile);
      toast.dismiss("aadhaar");
      toast.success("Aadhaar ID uploaded");
      toast.loading("Uploading College ID...", {
        id: "college",
      });
      const collegeUrl = await upload(clgFile);
      toast.dismiss("college");
      toast.success("College ID uploaded");
      form.setValue("aadhaarUrl", aadhaarUrl as string);
      form.setValue("collegeIdUrl", collegeUrl as string);
      form
        .handleSubmit(onSubmit)()
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const onSubmit = async (data: z.infer<typeof updateProfileZ>) => {
    setLoading(true);
    toast.loading("Saving Details...", {
      id: "loadingToast",
      position: "bottom-center",
    });

    //upload here
    console.log("Running");

    await updateProfile
      .mutateAsync({
        name: data.name,
        phone: data.phone,
        course: data.course,
        college: data.college,
        tshirtSize: data.tshirtSize,
        collegeIdUrl: data.collegeIdUrl,
        aadhaarUrl: data.aadhaarUrl,
      })
      .catch((error) => {
        console.log(error);
      });

    toast.dismiss("loadingToast");
  };

  

  return (
    <div className="max-h-max w-full">
      <Form {...form}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await something();
          }}
          className="flex flex-col gap-2 md:gap-4"
        >
          <h1 className="text-center text-xl lg:text-2xl ">
            Fill your Details
          </h1>
          <div className="mx-auto flex flex-col flex-wrap items-center justify-center gap-4 md:flex-row">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => {
                return (
                  <FormItem className="w-full md:w-[45%]">
                    <FormLabel className="">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            ></FormField>
            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="w-full md:w-[45%]">
                  <FormLabel className="">Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="Enter Phone Number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            {/* list of colleges*/}
            <FormField
              control={form.control}
              name="college"
              render={({}) => (
                <FormItem className="w-[80vw] md:w-[45%]">
                  <FormLabel className="">College</FormLabel>
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
                          className="w-full justify-between overflow-hidden truncate"
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
                        <Input
                          placeholder="Search college here..."
                          className="h-9"
                          value={collegeSearchQuery}
                          onChange={(e) => {
                            setCollegeSearchQuery(e.target.value);
                          }}
                        />
                        <ScrollArea className="h-72 pt-5">
                          <div className="group">
                            {selectedColleges?.length === 0 && (
                              <div className="text-center text-gray-500">
                                No colleges found
                              </div>
                            )}
                            {selectedColleges?.map((college) => (
                              <Button
                                variant="ghost"
                                className={`h-max w-full justify-start text-wrap text-start font-normal ${collegeId === college.id ? "bg-accent text-accent-foreground group-hover:bg-inherit group-hover:text-inherit group-hover:hover:bg-accent group-hover:hover:text-accent-foreground" : ""}`}
                                key={college.id}
                                onClick={(e) => {
                                  setCollegeId(college.id);
                                  form.setValue("college", college.id);
                                  setCollegevalue(
                                    college.name +
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
                              </Button>
                            ))}
                          </div>
                          <CreateCollege refetchColleges={refetchColleges} />
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            {/* Course */}
            <FormField
              control={form.control}
              name="course"
              render={({ field }) => (
                <FormItem className="w-full md:w-[45%]">
                  <FormLabel className="">Degree</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your Degree" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {courses.map((course, key) => (
                            <SelectItem value={course} key={key}>
                              {course}
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
            {/* T-Shirt Size */}
            <FormField
              control={form.control}
              name="tshirtSize"
              render={({ field }) => (
                <FormItem className="w-full md:w-[45%]">
                  <FormLabel className="flex items-center justify-between">
                    T-shirt Size
                    <a
                      href="/images/Size_Chart.jpeg"
                      download
                      className="cursor-pointer text-xs underline"
                    >
                      Download Size Chart
                    </a>
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your T-shirt size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.values(TshirtSize).map((size, key) => (
                            <SelectItem value={size} key={key}>
                              {size}
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
            {/* files */}
            <Card className="w-full">
              <CardContent className="grid gap-2 p-4 md:grid-cols-1 lg:grid-cols-2">
                <FormField
                  control={form.control}
                  name="aadhaarUrl"
                  render={({}) => (
                    <FormItem className="w-full md:w-[calc(90%+1.5rem)]">
                      <FormLabel className="">Aadhar Card</FormLabel>
                      <FormControl>
                        <div className="sm:py-2">
                          <Dropzone
                            onChange={setAadhaarFile}
                            className="w-full"
                            fileExtension="images"
                            image={getUrlAndId(user?.aadhaar ?? "").url || ""}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                ></FormField>

                <FormField
                  control={form.control}
                  name="collegeIdUrl"
                  render={({}) => {
                    // console.log(field)
                    return (
                      <FormItem>
                        <FormLabel>College ID Card</FormLabel>
                        <FormControl>
                          <div className="sm:py-2">
                            <Dropzone
                              onChange={setClgFile}
                              className="w-full"
                              fileExtension="images"
                              image={
                                getUrlAndId(user?.college_id ?? "").url || ""
                              }
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    );
                  }}
                ></FormField>
              </CardContent>
            </Card>
            <Button
              type="submit"
              disabled={loading}
              className={`mt-5 ${
                loading ? "cursor-not-allowed" : ""
              } flex items-center gap-2`}
            >
              {loading ? (
                <Loader2Icon size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save changes
            </Button>{" "}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProfileForm;
