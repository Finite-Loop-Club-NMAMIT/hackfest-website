import { useSession } from "next-auth/react";
import React from "react";
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import { useRouter } from "next/router";

const templateURL =
  "https://res.cloudinary.com/dwwno9ngw/raw/upload/v1737346827/Hackathon_Abstract_Submission_-_Goopy_Gophers_mjnwtt.pptx";

export default function IdeaDetails({ order }: { order: number }) {
  const { data } = useSession();
  const router = useRouter();

  if (order !== 0) {
    if (data?.user.team?.ideaSubmission) {
    } else {
      return (
        <div
          style={{ order: order }}
          className="flex flex-col flex-nowrap gap-4 rounded-md border-2 p-2"
        >
          <h1 className="text-xl">Idea Details</h1>
          <div className="relative flex h-full w-full flex-col items-center justify-center rounded-md text-center text-xl font-semibold text-black">
            <div className="absolute left-0 top-0 z-10 h-full w-full bg-gradient-to-r from-transparent via-red-700/80 to-transparent"></div>
            <div className="absolute left-0 top-0 z-0 h-full w-full bg-gradient-to-b from-[#132c5a]/80 via-transparent to-[#132c5a]/80"></div>
            <div className="z-20 flex h-full w-full flex-col justify-center bg-transparent p-4 backdrop-blur-xl">
              <p className="text-base text-white md:text-lg">
                You have not submitted your idea yet
              </p>
              <div className="mt-4 flex flex-row justify-center gap-2 md:gap-4">
                {data?.user.isLeader && (
                  <Button
                    className="text-xs md:text-sm"
                    onClick={async () => {
                      await router.push("/register");
                    }}
                  >
                    Submit
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex flex-row gap-1 text-xs text-white md:text-sm"
                  onClick={async () => {
                    // await router.push("/register?t=create");
                    const a = document.createElement("a");
                    a.href = templateURL;
                    a.download = "Idea_template.pptx";
                    a.click();
                  }}
                >
                  <Download className="size-4 md:size-5" />
                  Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    // }
    // return <div style={{ order: order }}>IdeaDetails</div>;
  }
}
