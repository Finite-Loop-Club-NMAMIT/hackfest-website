import Hero from "~/components/hero";
import Audio from "~/components/hero/audio";
import RootLayout from "~/components/layout";
import PrizePool from "~/components/prizePool";
import Timeline from "~/components/timeline";

export default function Home() {
  return (
    <RootLayout>
      <main className="relative mx-auto overflow-y-clip">
        <div className="absolute top-[100vh] z-50 h-40 w-full -translate-y-1/2"></div>

        {/* <Audio /> */}
        <Hero />
        <PrizePool />
        <Timeline />
      </main>
    </RootLayout>
  );
}
