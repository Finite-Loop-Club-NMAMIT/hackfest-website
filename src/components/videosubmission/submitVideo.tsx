import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { api } from "~/utils/api";
import { toast } from "sonner";

export default function SubmitVideo() {
  const [link, setLink] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const videoSubmissionQuery = api.video.isVideoSubmitted.useQuery();
  const submitVideoMutation = api.video.addVideoLink.useMutation({
    onSuccess: async () => {
      toast.success("Video submitted successfully!");
      setLink("");
      await videoSubmissionQuery.refetch();
      toast.dismiss("submit-video");
    },
    onError: () => {
      toast.error("Error submitting video");
      toast.dismiss("submit-video");
    },
  });

  async function handleSumbit() {
    setSubmitting(true);

    // HACK: only youtu because share links have domain as youtu.be
    if (link.includes("youtu") || link.includes("drive.google.com")) {
      toast.loading("Submitting video...", {
        id: "submit-video",
      });
      // FIXME: youtube video links (only) give cors issue even if hostnames are sepcified in next.config.js
      // const isValid = await fetch(link, { method: "HEAD", headers: {
      //   "Access-Control-Allow-Origin": "*"
      // } });

      submitVideoMutation.mutate({
        videoLink: link,
      });
    } else {
      toast.error("Url must be from youtube (youtu.be) or google drive");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-fit w-full max-w-5xl flex-col items-center justify-center rounded-lg bg-black/50 px-4 py-6">
      <h1 className="gradient-text my-2 text-3xl font-bold md:text-5xl">
        Video Submission
      </h1>

      <div className="mt-4 flex w-full flex-col items-center justify-center gap-4">
        <p className="my-4 max-w-lg text-center opacity-80 md:text-lg">
          Please submit your video link here. Make sure the video is publicly
          accessible. Only <strong>youtube</strong> or{" "}
          <strong>google drive</strong> links are allowed.
        </p>
        <Input
          className="w-full max-w-lg"
          placeholder="drive or youtube link"
          onChange={(e) => {
            const target = e.target;

            if (target) {
              setLink(target.value);
            }
          }}
        />
        <div className="flex w-full max-w-lg justify-evenly">
          <Button
            variant={"outline"}
            onClick={() => {
              if (typeof window !== undefined) {
                window.location.href = "/profile";
              }
            }}
          >
            Profile
          </Button>
          <Button
            disabled={submitting}
            variant={"default"}
            onClick={async () => {
              await handleSumbit();
            }}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
