import { useEffect, useState } from "react";

export default function Countown() {
  const eventTime = new Date("2022-10-15T00:00:00");
  const eventTimeSec = eventTime.getTime();

  const [time, setTime] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  function getRemaingTime() {
    const eventDate = new Date("2024-04-05T10:00:00").getTime();
    const currentDate = new Date().getTime();
    const remainingTime = eventDate - currentDate;

    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    setTime({ days, hours, minutes, seconds });
  }
  
  useEffect(() => {
    getRemaingTime();
    const interval = setInterval(() => {
      getRemaingTime();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-4 justify-even items-center text-center">
      <div className="flex flex-col gap-0 justify-center items-center">
        <span className="text-4xl font-bold justify-center items-center">
          {time.days.toString().padStart(2, "0")}
        </span>
        <span className="text-lg font-semibold">Days</span>
      </div>
      <div className="flex flex-col gap-0 justify-center items-center">
        <span className="text-4xl font-bold justify-center items-center">
          {time.hours.toString().padStart(2, "0")}
        </span>
        <span className="text-lg font-semibold">Hours</span>
      </div>
      <div className="flex flex-col gap-0 justify-center items-center">
        <span className="text-4xl font-bold justify-center items-center">
          {time.minutes.toString().padStart(2, "0")}
        </span>
        <span className="text-lg font-semibold">Minutes</span>
      </div>
      <div className="flex flex-col gap-0 justify-center items-center">
        <span className="text-4xl font-bold justify-center items-center">
          {time.seconds.toString().padStart(2, "0")}
        </span>
        <span className="text-lg font-semibold">Seconds</span>
      </div>
    </div>
  );
}
