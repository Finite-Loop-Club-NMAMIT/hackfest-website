import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import Link from "next/link";

type Event = {
  day: number;
  title: string;
  time: string;
};

const Timeline = ({ events }: { events: Event[] }) => {
  const [selectedDay, setSelectedDay] = useState(1);
  useEffect(() => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#timeline",
          scrub: 0.2,
          start: "top top",
          end: "+=10000",
        },
      })
      .to("#disc", {
        rotation: -360 * 7,
        duration: 2,
        ease: "none",
      });
  }, [selectedDay]);

  const ref = useRef(null);

  const divisions = selectedDay === 1 ? 16 : 14;
  ``;

  return (
    <>
      {/* Main div which spans entire scroll area for the animation */}
      <div
        className="pointer-events-none h-[200vh]"
        id="timeline"
        ref={ref}
        style={{ zIndex: 2, scrollBehavior: "smooth" }}
      >
        {/* Div which is sticky and spans the height of the viewport */}
        <div className="sticky top-0 flex h-screen overflow-x-clip">
          {/* Wheel container */}
          <div className="absolute right-full top-1/2 flex h-[150vw] max-h-[80rem] min-h-[36rem] w-[150vw] min-w-[36rem] max-w-7xl -translate-y-1/2 translate-x-1/2 items-center justify-center overflow-hidden">
            {/* Wheel */}
            <div
              className="relative h-full  w-full origin-center rounded-full"
              id="disc"
            >
              <Image
                src={"/images/realVinyl.png"}
                fill
                alt="CD"
                className="object-cover object-center"
              />
              {/* Event */}
              {events.map((event, index) => {
                if (event.day === selectedDay)
                  return (
                    <Event
                      key={index}
                      event={event}
                      position={{ angle: (4 * Math.PI) / divisions, index }}
                    />
                  );
              })}
            </div>
          </div>

          <div className="absolute left-full top-1/2 flex h-[150vw] max-h-[80rem] min-h-[36rem] w-[150vw] min-w-[36rem] max-w-7xl  -translate-x-[59%] -translate-y-1/2 items-center justify-center overflow-hidden md:-translate-x-[63%] lg:-translate-x-[75%] xl:-translate-x-[85%] 2xl:-translate-x-[90%]">
            {/* Wheel */}
            <div className="flex flex-col items-center justify-center gap-5">
              <h1 className="hidden font-obscura text-7xl lg:block lg:text-8xl">
                Day{" "}
                <span className="font-sans font-extrabold">{selectedDay}</span>
              </h1>
              <span className="flex flex-col gap-5 lg:flex-row ">
                {[1, 2, 3].map((day) => {
                  return (
                    <Link href="/#timeline" key={day}>
                      <button
                        className={`pointer-events-auto relative flex h-32 w-32 items-center justify-center ${day === selectedDay ? "scale-125" : "hover:scale-110 "} duration-300`}
                        // className="bg-gradient-to-br from-[#008080] via-black to-[#008080] backdrop-blur-xl border-2 border-[#008080] pointer-events-auto text-2xl rounded-xl w-16 h-16"
                        onClick={() => setSelectedDay(day)}
                      >
                        <Image
                          src="/images/realVinyl.png"
                          alt="disc"
                          width={100}
                          height={100}
                        />
                        <span className=" absolute text-3xl font-bold text-black brightness-200">
                          {day}
                        </span>
                      </button>
                    </Link>
                  );
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Timeline;

const Event = ({
  event,
  position,
}: {
  event: Event;
  position: { angle: number; index: number };
}) => {
  return (
    <>
      {/* Event title - in the direction Normal to the boundary of wheel */}
      <div
        className="absolute flex max-w-[20%] origin-center flex-col text-lg font-bold text-white md:text-3xl"
        style={{
          top: `${50 + 25 * Math.sin(position.index * position.angle)}%`,
          left: `${50 + 25 * Math.cos(position.index * position.angle)}%`,
          transform: `translate(-50%, -50%) rotate(${
            position.angle * position.index
          }rad)`,
        }}
      >
        <span>{event.title}</span>
        <span>{event.time}</span>
      </div>
    </>
  );
};
