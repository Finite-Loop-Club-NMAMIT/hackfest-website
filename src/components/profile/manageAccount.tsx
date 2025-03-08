import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { signOut, useSession } from "next-auth/react";

export default function ManageAccount() {
  const { status, data } = useSession();

  return (
    <div className="mt-4 flex w-full flex-col justify-center items-center gap-4">
      {/* FIXME: switch account causes error for some reason. probably token thing */}
      {/* <Button
        className="flex flex-nowrap items-center justify-center gap-2 text-xs md:text-sm"
        onClick={async() => {
          await signIn("google");
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="size-4 md:size-5"
        >
          <path
            fill="currentColor"
            d="m12 0l-.66.03l3.81 3.81L16.5 2.5c3.25 1.57 5.59 4.74 5.95 8.5h1.5C23.44 4.84 18.29 0 12 0m0 4c-1.93 0-3.5 1.57-3.5 3.5S10.07 11 12 11s3.5-1.57 3.5-3.5S13.93 4 12 4M.05 13C.56 19.16 5.71 24 12 24l.66-.03l-3.81-3.81L7.5 21.5c-3.25-1.56-5.59-4.74-5.95-8.5zM12 13c-3.87 0-7 1.57-7 3.5V18h14v-1.5c0-1.93-3.13-3.5-7-3.5"
          />
        </svg>
        Switch
      </Button> */}
      {status === "authenticated" &&
        data.user.profileProgress !== "FILL_DETAILS" && (
          <p className="text-xl font-bold">{data?.user.name}</p>
        )}
      <Button
        variant="destructive"
        className="flex flex-nowrap items-center justify-center gap-2 text-xs md:text-sm"
        onClick={async () => {
          await signOut({
            callbackUrl: "/",
          });
        }}
      >
        <LogOut className="size-4 md:size-5" />
        Log Out
      </Button>
    </div>
  );
}
