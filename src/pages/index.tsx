import AboutHackfest from "~/components/aboutHackfest";
import Domains from "~/components/domains";
import { FAQ } from "~/components/faq";
import Hero from "~/components/hero";
import Audio from "~/components/hero/audio";
import RootLayout from "~/components/layout";
import PrizePool from "~/components/prizePool";
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
        <Timeline2 />
        <AboutHackfest />
        <PrizePool />
        <Domains domainList={domains} />
        <Timeline events={events} />
        <Sponsors />
        <FAQ />
      </main>
    </RootLayout>
  );
}

const events = [
  {
    day: 1,
    title: "Check-in",
    time: "10-11AM",
  },
  {
    day: 1,
    title: "Onboarding",
    time: "11AM-12PM",
  },
  {
    day: 1,
    title: "Lunch",
    time: "12-1PM",
  },
  {
    day: 1,
    title: "Inaugural",
    time: "1-4PM",
  },
  {
    day: 1,
    title: "Snacks",
    time: "4-4:30PM",
  },
  {
    day: 1,
    title: "Hackathon Starts",
    time: "5PM",
  },
  {
    day: 1,
    title: "Dinner",
    time: "8PM",
  },
  {
    day: 1,
    title: "Engagement activities",
    time: "9PM",
  },

  {
    day: 2,
    title: "Breakfast",
    time: "8-9AM",
  },
  {
    day: 2,
    title: "Lunch",
    time: "1-2PM",
  },
  {
    day: 2,
    title: "Cool Off Time",
    time: "3-4PM",
  },
  {
    day: 2,
    title: "Snack Break",
    time: "4PM",
  },
  {
    day: 2,
    title: "Dinner",
    time: "8-9PM",
  },
  {
    day: 2,
    title: "Engagement Activities",
    time: "9PM",
  },

  {
    day: 3,
    title: "Hackathon ends",
    time: "7AM",
  },
  {
    day: 3,
    title: "Breakfast",
    time: "7-8AM",
  },
  {
    day: 3,
    title: "Top 15 Final Pitch",
    time: "From 9:30AM",
  },
  {
    day: 3,
    title: "Lunch",
    time: "12-1.30PM",
  },
  {
    day: 3,
    title: "Winners Selection",
    time: "1.30PM",
  },
  {
    day: 3,
    title: "Closing ceremony",
    time: "1.30PM",
  },
  {
    day: 3,
    title: "Checkout",
    time: "3PM",
  },
];
