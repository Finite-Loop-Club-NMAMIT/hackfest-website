import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import { useRouter } from "next/router";
import { downloadPPT } from "~/utils/helper";

export default function IdeaDetails({ order }: { order: number }) {
  const { data } = useSession();
  const router = useRouter();

  console.log(data?.user.team?.ideaSubmission);

  if (order !== 0) {
    if (data?.user.team?.ideaSubmission) {
      return (
        <div
          className="flex h-full flex-col gap-4 rounded-md border-2 p-2"
          style={{ order: order }}
        >
          <h1 className="text-xl">Idea Details</h1>
          <div className="mb-4 flex h-full w-full flex-col items-center justify-center gap-4">
            {/* FIXME: pdf preview and pdf download not working. cloudinary issue. */}
            {/* <PdfPreview /> */}
            {/* <Button onClick={async() => { await fetchIdeaSubmission()}}>click</Button> */}
            {/* <iframe src={data.user.team.ideaSubmission.split(";")[0]}></iframe> */}
            {/* <Button className="mx-auto" onClick={async() => {
                  const a = document.createElement("a");
                  a.href = data.user.team.ideaSubmission.split(";")[0];
                  a.download = "Idea_Submission.pdf";
                  a.click();
                  }}>Download</Button> */}
            <p className="w-full max-w-md px-4 text-center opacity-80">
              You have successfully submitted you idea. We wish you to be in the
              top <span className="font-semibold">60</span>💐
            </p>
          </div>
        </div>
      );
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
                    await downloadPPT();
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
