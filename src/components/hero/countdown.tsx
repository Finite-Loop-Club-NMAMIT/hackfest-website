import { useEffect, useState } from "react";

export default function Countown({ eventTime }: { eventTime: Date }) {
  const eventTimeSec = eventTime.getTime();

  function remainingTime() {
    const currentTime = new Date().getTime();
    const remainingTime = eventTimeSec - currentTime;

    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  }

  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setInterval(() => {
      setTime(remainingTime());
    }, 1000);
  }, []);

  return (
    <div className="flex gap-4 justify-center items-center text-center">
      <div className="flex flex-col gap-0 justify-center items-center">
        <span className="text-4xl font-bold justify-center items-center">
          {time.days.toString().padStart(2, "0")}
        </span>
        <span className="text-lg font-semibold">Days</span>
      </div>
      <div className="flex flex-col gap-0">
        <span className="text-4xl font-bold justify-center items-center">
          {time.hours.toString().padStart(2, "0")}
        </span>
        <span className="text-lg font-semibold">Hours</span>
      </div>
      <div className="flex flex-col gap-0">
        <span className="text-4xl font-bold justify-center items-center">
          {time.minutes.toString().padStart(2, "0")}
        </span>
        <span className="text-lg font-semibold">Minutes</span>
      </div>
      <div className="flex flex-col gap-0">
        <span className="text-4xl font-bold justify-center items-center">
          {time.seconds.toString().padStart(2, "0")}
        </span>
        <span className="text-lg font-semibold">Seconds</span>
      </div>
    </div>
  );
}
