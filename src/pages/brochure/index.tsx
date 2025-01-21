import { Loader2Icon } from "lucide-react";
import { useEffect } from "react";
import RootLayout from "~/components/layout";

const Brochure = () => {
  useEffect(() => {
    window.open("/brochure.pdf");
  }, []);

  return (
    <RootLayout>
      <div
        className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-[url("/images/blue-grainy.png")] bg-cover bg-center px-5 py-40 md:p-40`}
      >
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center bg-black/20"></div>

        <div className="z-10 flex w-full flex-col items-center justify-center rounded-3xl border border-white/20 bg-black/50 px-5 py-10">
          <div className="flex flex-col justify-center text-center">
            <h1 className="bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-7xl font-black text-transparent md:text-9xl">
              Oops!
            </h1>

            <p className="md:text-md mb-5 mt-4 text-sm text-gray-300">
              You have typed the wrong URL for brochure. But anyways, let&apos;s
              get it done.
            </p>

            <div className="flex w-full items-center justify-center gap-2 text-sm">
              <p> Opening the brochure...</p>
              <Loader2Icon size={24} className="animate-spin" />
            </div>

            <p className="mt-5 text-sm">
              Brochure should be opening now, if not, please{" "}
              <a
                href="/brochure.pdf"
                download={"brochure.pdf"}
                className="underline"
              >
                click this
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </RootLayout>
  );
};

export default Brochure;
