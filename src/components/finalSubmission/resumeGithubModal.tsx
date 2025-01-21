import { inferRouterOutputs } from "@trpc/server";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { teamRouter } from "~/server/api/routers/team";
import { Progress } from "@prisma/client";
import { toast } from "sonner";
import { env } from "~/env";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { Dropzone } from "../ui/dropZone";
import { set } from "zod";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";

export default function ResumeGithubModal({
  teamdata,
  userId,
  refetchTeam,
}: {
  teamdata:
    | inferRouterOutputs<typeof teamRouter>["getTeamDetailsById"]
    | null
    | undefined;
  userId: string;
  refetchTeam?: () => void;
}) {
  const [resumes, setResumes] = useState<
    {
      userId: string;
      resume: File | null;
      resumeUrl: string | undefined;
      github: string;
    }[]
  >([]);

  const [transport, setTransport] = useState<boolean>(false);
  const submitResume = api.finalSubmission.submitResume.useMutation({
    onSuccess: () => {
      toast.success("Resume Uploaded");
    },
    onError: () => {
      toast.error("Error Uploading Resume");
    },
  });
  const submitGithub = api.finalSubmission.submitGithub.useMutation({
    onSuccess: () => {
      toast.success("Github Submitted");
    },
    onError: () => {
      toast.error("Error Submitting Github");
    },
  });
  const teamTransportation = api.finalSubmission.markTransport.useMutation({
    onSuccess: () => {
      toast.success("Transportation Confirmed");
    },
    onError: () => {
      toast.error("Error Marking Transportation");
    },
  });

  const leader = teamdata?.members?.find(
    (member) => member.id === userId && member?.isLeader,
  );

  const teamMembers = teamdata?.members ?? [];

  teamMembers.sort((a, b) =>
    a.isLeader === b.isLeader ? 0 : a.isLeader ? -1 : 1,
  );

  useEffect(() => {
    setResumes(
      teamMembers.map((member) => {
        return {
          userId: member.id,
          resume: null,
          resumeUrl: "",
          github: "",
        };
      }),
    );
  }, [teamMembers]);

  useEffect(() => {
    console.log(resumes);
  }, [resumes]);

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
  async function submitResumeAndGithub() {
    if (
      resumes.length === teamMembers.length &&
      resumes.filter(
        (resume) => resume.resumeUrl === "" && resume.github === "",
      ).length === 0
    ) {
      if (
        resumes.filter(
          (resume) =>
            typeof resume?.resume?.size === "number" &&
            resume?.resume?.size > 2 * 1000 * 1000,
        ).length !== 0
      )
        return toast.error("Uploads must be less than 2Mb");
      toast.loading("Uploading Resumes", {
        id: "uploadingResumes",
      });

      const uploadPromises = resumes.map(async (resume) => {
        if (resume.resume) {
          const res = (await upload(resume.resume)) as string;
          return { ...resume, resumeUrl: res.split(";")[0] };
        }
        return resume;
      });

      const updatedResumes = await Promise.all(uploadPromises);

      resumes.map((resume) => {
        resume.resume = null;
      });

      // await submitPaymentMutation.mutateAsync({
      //     paymentId: transactionId,
      //     paymentProof: (newFile as string).split(';')[0] ?? '',
      //     teamId: teamId
      // }).then(() => {
      //     refetchTeam?.()
      // })

      const submitPromises = updatedResumes.map(async (resume) => {
        const githubUrl = resume.github;
        const regex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9]+)/;
        const match = githubUrl.match(regex);
        const githubUsername = match ? match[1] : githubUrl;
        await submitResume.mutateAsync({
          userId: resume.userId,
          resume: resume.resumeUrl ?? "",
        });

        await submitGithub.mutateAsync({
          userId: resume.userId,
          github: githubUsername ?? "",
        });

        if (transport && teamdata) {
          await teamTransportation.mutateAsync({
            teamId: teamdata.id,
          });
        }
        refetchTeam?.();
      });

      await Promise.all(submitPromises);
      toast.dismiss("uploadingResumes");
    } else {
      toast.info("Fill all fields!");
    }
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Details</Button>
        </DialogTrigger>
        <DialogContent className="mx-auto max-h-[60dvh] max-w-[95vw] items-center justify-center space-y-8 overflow-y-auto p-8 md:max-w-fit">
          <h1 className="text-2xl font-bold text-white">Upload Resumes</h1>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {resumes.map((resume, index) => {
              return (
                <div key={index} className="flex flex-col gap-2">
                  <Label className="overflow-hidden truncate text-white">
                    {
                      teamMembers.find((member) => member.id === resume.userId)
                        ?.name
                    }
                  </Label>
                  <Dropzone
                    onChange={(e) => {
                      setResumes((prev) => {
                        const newResumes = [...prev];
                        // @ts-expect-error idk
                        newResumes[index].resume = e;
                        return newResumes;
                      });
                    }}
                    className="w-full"
                    fileExtension=""
                    pdf
                    image={resume.resumeUrl}
                    key={index}
                  />
                </div>
              );
            })}
          </div>
          <h1 className="text-2xl font-bold text-white">Github Usernames</h1>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            {resumes.map((resume, index) => {
              return (
                <div
                  className="flex flex-col items-center justify-between gap-2"
                  key={index}
                >
                  <Label className="overflow-hidden truncate text-white">
                    {
                      teamMembers.find((member) => member.id === resume.userId)
                        ?.name
                    }
                  </Label>
                  <Input
                    value={resume.github}
                    placeholder="Github"
                    onChange={(e) => {
                      setResumes((prev) => {
                        const newResumes = [...prev];
                        // @ts-expect-error idk
                        newResumes[index].github = e.target.value;
                        return newResumes;
                      });
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex flex-col items-center justify-between gap-5">
            <div className="flex gap-2">
              <input
                type="checkbox"
                onChange={(e) => {
                  setTransport(e.target.checked);
                }}
              />
              <label className="text-white">
                Do you need bus from Mangalore station?
              </label>
            </div>
            <Badge className="flex gap-2 border border-yellow-500 bg-yellow-500/20 text-center text-white hover:bg-yellow-500/20">
              Bus will arrive at 8:30AM and leave at 9:00 AM from <br />{" "}
              Mangalore Central Railway Station
            </Badge>
            <Button
              onClick={async () => {
                await submitResumeAndGithub();
              }}
            >
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
