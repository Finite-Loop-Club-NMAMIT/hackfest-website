import React from "react";

export default function ResumeDetails({ order }: { order: number }) {
  if (order)
    return (
      <div
        className="h-full w-full rounded-md border-2 p-2"
        style={{ order: order }}
      >
        <h1 className="text-xl">Resume</h1>
        <div className="flex items-center justify-center h-full">
          your resume details
        </div>
      </div>
    );
}
