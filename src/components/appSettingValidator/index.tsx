import { useSession } from "next-auth/react";
import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/router";

const AppSettingValidator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { open: boolean; text: string }
>(({ open, text, ...props }, ref) => {
  const { data } = useSession();
  const router = useRouter();

  if (!open) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="mx-4 h-fit w-full max-w-[70rem] rounded-xl bg-black/50 p-10 text-center text-white">
          <h1 className="bg-gradient-to-b from-red-300 via-red-800 to-red-500 bg-clip-text text-5xl font-bold text-transparent md:text-8xl">
            Too Late!
          </h1>
          <p className="mt-8 md:text-xl">
            Sorry{" "}
            <span className="font-semibold">
              {data?.user.name ?? "Tech Enthusiast"}
            </span>
            . {text}
          </p>
          <Button
            className="mt-8"
            variant="outline"
            onClick={() => {
              void router.push("/");
            }}
          >
            Home
          </Button>
        </div>
      </div>
    );
  } else {
    return <div className="h-full w-full" ref={ref} {...props} />;
  }
});

AppSettingValidator.displayName = "AppSettingValidator";

export default AppSettingValidator;
