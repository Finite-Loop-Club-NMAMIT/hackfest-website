import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "../ui/badge";

const AddVideoSubmission = () => {
  const [open, setOpen] = useState(false);
  const [videoLink, setVideoLink] = useState("");

  const { data: isVideoSubmitted, refetch } =
    api.video.isVideoSubmitted.useQuery();

  const { data: isVideoSubmissionOpen } =
    api.video.isVideoSubmissionOpen.useQuery();

  const addVideoLink = api.video.addVideoLink.useMutation({
    onSuccess: async () => {
      await refetch();
      toast.dismiss();
      toast.success("Video link submitted successfully");
      setOpen(false);
    },

    onError: ({ message }) => {
      toast.dismiss();
      toast.error(message);
    },
  });

  if (isVideoSubmissionOpen && !isVideoSubmitted) {
    return (
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
        }}
      >
        <DialogTrigger>
          <Button>Video Submission</Button>
        </DialogTrigger>
        <DialogContent className="max-w-96">
          <DialogHeader>
            <DialogTitle className="mb-4">
              Submit your uploaded video link
            </DialogTitle>
            <DialogDescription className="flex flex-col items-center justify-center gap-3">
              <Badge className="bg-red-500/50 px-3 py-1 text-center text-white hover:bg-red-500/50">
                Note: You can only submit the link once. Once submitted it
                cannot be changed
              </Badge>
              <Input
                placeholder="Video Link"
                value={videoLink}
                onChange={(e) => {
                  setVideoLink(e.target.value);
                }}
              />
              <Button
                onClick={() => {
                  try {
                    z.string().url().parse(videoLink);
                    toast.loading("Submitting video link...");
                    addVideoLink.mutate({ videoLink });
                  } catch {
                    toast.error("Invalid URL");
                  }
                }}
              >
                Submit
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }
};

export default AddVideoSubmission;
