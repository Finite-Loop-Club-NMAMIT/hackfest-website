import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

const NotFound = () => {
  const router = useRouter();
  return (
    <div
      className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#0b1328] from-[10%] via-[#153164] to-[#0b1328] bg-cover bg-center px-5 py-40 md:p-40`}
    >
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center bg-black/20"></div>

      <div className="z-10 flex w-full flex-col items-center justify-center rounded-3xl border border-white/20 bg-black/50 px-5 py-10">
        <div className="flex flex-col justify-center text-center">
          <h1 className="bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-7xl font-black text-transparent md:text-9xl">
            Oops!
          </h1>

          <p className="md:text-md mb-5 mt-4 text-sm text-gray-300">
            You need to be logged in to view this page
          </p>

          <Button variant={"secondary"} onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
