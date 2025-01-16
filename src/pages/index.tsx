import AboutHackfest from "~/components/aboutHackfest";
import Domains from "~/components/domains";
import { FAQ } from "~/components/faq";
import Hero from "~/components/hero";
import Audio from "~/components/hero/audio";
import RootLayout from "~/components/layout";
import PrizePool from "~/components/prizePool";
import PrizePool2 from "~/components/prizePool2";
import Sponsors from "~/components/sponsors";
import Timeline from "~/components/timeline";
import Timeline2 from "~/components/timeline2";
import { domains } from "~/constants";

export default function Home() {
  return (
    <RootLayout>
      <main className="relative mx-auto overflow-y-clip">
        <div
          className="absolute -z-50 mt-[100vh] h-full w-full bg-gradient-to-b from-blue-950  to-blue-700"
          // style={{
          //   background:
          //     "url('/images/noise.svg') repeat,linear-gradient(180deg, #060e3c 0%, #052d4f 30%, #001933 100%)",
          // }}
        ></div>
        <div className="absolute top-[100vh] z-50 h-40 w-full -translate-y-1/2"></div>
        <Audio />
        <Hero />
        <PrizePool2 />
        <Timeline2 />
        <AboutHackfest />
        <PrizePool />
        <Domains domainList={domains} />
        {/* <Timeline events={events} /> */}
        <Sponsors />
        <FAQ />
      </main>
    </RootLayout>
  );
}
