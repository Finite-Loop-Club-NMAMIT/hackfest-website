import { api } from "~/utils/api";
import RootLayout from "~/components/layout";
import { Card } from "~/components/ui/card";
import Confetti from "react-dom-confetti";
import { useEffect, useState } from "react";
import Spinner from "~/components/spinner";

export default function Results() {
  const topTeams = api.team.getTop60.useQuery().data;
  const teamID = api.user.getUserWithTeam.useQuery().data?.teamId;

  const config = {
    angle: 290,
    spread: 300,
    startVelocity: 40,
    elementCount: 50,
    dragFriction: 0.11,
    duration: 4020,
    stagger: 3,
    width: "8px",
    height: "14px",
    perspective: "503px",
    colors: [
      "#f00",
      "#0f0",
      "#00f",
      "#FFC700",
      "#FF0000",
      "#2E3191",
      "#41BBC7",
    ],
  };

  const [show, setShow] = useState(false);

  const ConfettiExplosion = () => {
    setShow(true);
    setTimeout(() => setShow(false), 1000);
  };

  useEffect(() => {
    if (topTeams) ConfettiExplosion();
  }, [topTeams]);

  // return <NotFound />;

  return (
    <RootLayout>
      <div className="min-h-screen overflow-clip bg-gradient-to-b from-[#060e3c] via-[#052d4f] to-[#001933] py-20 text-center text-5xl">
        {topTeams && (
          <div className="flex flex-col gap-4 pb-12 pt-12">
            <div className="px-4 text-3xl font-semibold md:text-5xl">
              Congratulations!
            </div>
            <div className="px-4 text-sm opacity-60">
              Here are the top teams selected for Hackfest 2024, See y&apos;all
              at NMAMIT!
            </div>
          </div>
        )}
        <div className="flex w-full items-center justify-center">
          <Confetti active={show} config={config} />
        </div>
        {!topTeams ? (
          <div className="absolute left-1/2 top-1/2 flex translate-x-[-50%] translate-y-[-50%] items-center justify-center gap-2 text-sm md:text-xl">
            <div className="whitespace-nowrap">Loading results...</div>
            <Spinner />
          </div>
        ) : (
          <div className="flex flex-row flex-wrap items-stretch justify-center gap-10 px-10">
            {topTeams?.map((team) => (
              <Card
                key={team.id}
                className={`${teamID === team.id && "bg-base-400"} flex w-80 items-center justify-center border-2 px-4 py-4 text-center hover:scale-[1.01]`}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="text-2xl font-semibold">{team.name}</div>
                  <div className="text-sm opacity-60">
                    {team.members[0]?.college?.name}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        {topTeams && (
          <div className="mx-8 mt-10 px-3 text-sm opacity-60 md:px-20">
            It was hard for us to shortlist the top ideas, because of all the
            quality ideas we received. It was based on multiple criterias like
            innovation, creative features, relevance to track, market fit,
            feasibility, existing solution comparision etc. If your team
            didn&apos;t make it to top, don&apos;t worry, bounce back stronger
            at Hackfest 2025! See you there.
          </div>
        )}
      </div>
    </RootLayout>
  );
}
