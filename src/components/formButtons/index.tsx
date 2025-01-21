import React, { useContext, useState } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Loader2Icon } from "lucide-react";
import { ProgressContext } from "../progressProvider";
import { type Progress } from "@prisma/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { api } from "~/utils/api";

const FormButtons = ({
  profileProgress,
  isComplete,
  isLeader,
  isInTeam,
}: {
  profileProgress: Progress;
  isComplete: boolean;
  isLeader: boolean;
  isInTeam: boolean;
}) => {
  const { currentState, setCurrentState, setMaxState } =
    useContext(ProgressContext);
  let isDisabled = true;
  if (currentState === 0) {
    if (profileProgress === "FORM_TEAM" || profileProgress === "SUBMIT_IDEA")
      isDisabled = false;
  } else if (currentState === 1) {
    if (isLeader && isComplete) {
      isDisabled = false;
    }
  } else if (currentState === 2) {
    if (profileProgress === "SUBMIT_IDEA") isDisabled = true;
  } else isDisabled = true;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const updateProfileProgress = api.user.updateProfileProgress.useMutation({
    onSuccess: () => {
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    },
  });

  return (
    <div className="flex items-center justify-between">
      <Button
        onClick={() => {
          if (currentState === 0) return;
          setCurrentState(currentState - 1);
        }}
        disabled={currentState === 0}
        className="flex items-center gap-2"
      >
        <ChevronLeft size={16} />
        Previous
      </Button>
      <span className="text-center text-xs">
        {currentState === 1 &&
          !isLeader &&
          isInTeam &&
          "Only leader can proceed"}
      </span>
      {currentState !== 2 && (
        <Button
          disabled={isDisabled}
          onClick={async () => {
            if (currentState === 0) {
              if (
                profileProgress === "FORM_TEAM" ||
                profileProgress === "SUBMIT_IDEA"
              )
                setCurrentState(currentState + 1);
            } else if (currentState === 1) {
              if (isLeader && isComplete) {
                setIsLoading(true);
                profileProgress !== "SUBMIT_IDEA" &&
                  toast.promise(
                    async () => await updateProfileProgress.mutateAsync(),
                    {
                      position: "bottom-center",
                      loading: "Proceeding...",
                      success: "Done!",
                      error: (error) => {
                        return "Something went wrong";
                      },
                    },
                  );
                setMaxState(2);
                setCurrentState(currentState + 1);
                setIsLoading(false);
              }
            } else if (currentState === 2) {
              if (profileProgress === "SUBMIT_IDEA") return;
            } else return;
          }}
          className="flex items-center gap-2"
        >
          {/* {currentState === 2 ? "Submit" : "Next"} */}
          {isLoading && <Loader2Icon size={16} className="animate-spin" />}
          {isLoading ? "Proceeding..." : "Next"}
          <ChevronRight size={16} />
        </Button>
      )}
    </div>
  );
};

export default FormButtons;
