import Image from "next/image";
import { SectionHeading } from "../ui/sectionHeading";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import Link from "next/link";

const Sponsors = () => {
  return (
    <>
      <section
        id="sponsors"
        className="flex min-h-screen flex-col items-center justify-around gap-2 py-20 transition-all"
      >
        <SectionHeading
          title="Sponsors"
          classname="text-5xl md:text-6xl xl:text-7xl"
        />

        <div className="flex w-full max-w-6xl flex-col items-center justify-center gap-16 xl:flex-row xl:justify-around xl:gap-4">
          <div className="flex w-full flex-col items-center justify-center gap-5 xl:w-1/3">
            <h2 className="flex h-24 items-center justify-center text-center text-3xl font-semibold xl:text-4xl ">
              Powered By
            </h2>
            <Link href="/sponsors">
              <div className="relative aspect-square w-52 rounded-2xl border-2 border-teal-600 bg-gradient-to-br from-teal-700/50 via-teal-300/50 to-teal-700/50 backdrop-blur-2xl md:w-60">
                <Image
                  className="rounded-2xl"
                  src="/logos/sponsors/EGHD.jpg"
                  alt="EGHD"
                  fill={true}
                />
              </div>
            </Link>
          </div>

          <div className="flex w-full flex-col items-center justify-center gap-5 xl:w-1/3">
            <h2 className="flex h-24 items-center justify-center text-center text-3xl font-semibold xl:text-4xl">
              Co-Powered By
            </h2>
            <Link href="/sponsors">
              <div className="relative aspect-square w-52 rounded-2xl border-2 border-teal-600 bg-gradient-to-br from-teal-700/50 via-teal-300/50 to-teal-700/50 backdrop-blur-2xl md:w-60">
                <Image
                  className="rounded-2xl"
                  src="/logos/sponsors/Niveus.jpg"
                  alt="Niveus"
                  fill={true}
                />
              </div>
            </Link>
          </div>

          <div className="flex w-full flex-col items-center justify-center gap-5 xl:w-1/3">
            <h2 className="flex h-24 items-center justify-center text-center text-3xl font-semibold xl:text-4xl">
              Associate Sponsors
            </h2>
            <Link href="/sponsors">
              <div className="relative aspect-square w-52 rounded-2xl border-2 border-teal-600 bg-gradient-to-br from-teal-700/50 via-teal-300/50 to-teal-700/50 backdrop-blur-2xl md:w-60">
                <Image
                  className="rounded-2xl p-6"
                  src="/logos/sponsors/The_Global_Point.png"
                  alt="The_Global_Point"
                  fill={true}
                />
              </div>
            </Link>
          </div>
        </div>

        <div className="relative mx-10 mt-16 flex w-full max-w-[90vw] flex-row items-center justify-center gap-10 rounded-2xl border-2 border-teal-600 bg-gradient-to-br from-teal-700/50 via-teal-300/50 to-teal-700/50 text-center shadow-[0_0_3px_1px_#b9b7b7ad] backdrop-blur-2xl sm:w-[40rem] md:w-[72rem] md:max-w-[90%] xl:gap-20">
          <div className="relative hidden aspect-square h-52 md:flex">
            <Image src="/logos/logo.png" alt="Hackfest_Logo" fill />
          </div>
          <div className="hidden h-40 w-1 rounded-full bg-white md:flex"></div>
          <div className="flex flex-col items-center justify-center gap-5 p-6 xl:p-7 ">
            <p>Any event is incomplete without support and love</p>
            <h3 className="text-3xl font-semibold">
              Interested in sponsoring us?
            </h3>
            <a href="mailto:sponsor@hackfest.dev">
              <Button
                size={"lg"}
                className="group flex items-center gap-2 text-lg"
              >
                Reach Out To Us{" "}
                <Send
                  size={16}
                  className="transition-transform duration-300 group-hover:rotate-12"
                />
              </Button>
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Sponsors;
