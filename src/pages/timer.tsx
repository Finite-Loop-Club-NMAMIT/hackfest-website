import { useEffect, useState } from "react";
import Spinner from "~/components/spinner";
import { api } from "~/utils/api";


export const CountdownTimer = () => {
  const { data: appSettings } = api.appSettings.getAppSettings.useQuery();
  const [timeLeft, setTimeLeft] = useState<string>("Not started");
  const [elapsedTime, setElapsedTime] = useState<string>(""); // Add state for elapsed time

  // Safe conversion of date string/object to Date
  const toSafeDate = (date: unknown): Date | null => {
    if (!date) return null;
    
    try {
      const parsedDate = new Date(date as string | number | Date);
      return isNaN(parsedDate.getTime()) ? null : parsedDate;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    // Type-safe access to hackfestStarted value
    const hackfestStartTime = toSafeDate(appSettings?.isHackfestStarted);

    if (!hackfestStartTime) {
      setTimeLeft("Not started");
      setElapsedTime("");
      return;
    }

    const calculateTimeLeft = () => {
      const endTime = new Date(hackfestStartTime.getTime() + (36 * 60 * 60 * 1000));
      const now = new Date();
      const difference = endTime.getTime() - now.getTime();

      // Calculate elapsed time
      const elapsedMs = now.getTime() - hackfestStartTime.getTime();
      const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
      const elapsedMinutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
      const elapsedSeconds = Math.floor((elapsedMs % (1000 * 60)) / 1000);
      setElapsedTime(`${elapsedHours}h ${elapsedMinutes}m ${elapsedSeconds}s`);

      if (difference <= 0) {
        setTimeLeft("Time's up!");
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [appSettings?.isHackfestStarted]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="rounded-3xl p-10 shadow-2xl backdrop-blur-lg md:min-w-[500px] lg:min-w-[700px]">
        {!appSettings ? (
          <div className="flex flex-col items-center justify-center p-20">
            <div className="mb-4 text-2xl text-gray-300">Loading...</div>
            <Spinner />
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-4 text-3xl font-bold text-gray-200 md:text-4xl">
              Time Remaining
            </div>
            <div className="relative mb-10">
              <div className="mb-8 bg-gradient-to-r from-rose-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent md:text-7xl lg:text-8xl">
                {timeLeft}
              </div>
            </div>
            {appSettings?.isHackfestStarted && (
              <div className="mb-8 p-4">
                <div className="text-2xl font-medium text-gray-200 md:text-3xl">
                  Elapsed Time   :   <span className="text-white font-bold">{elapsedTime}</span>
                </div>
              </div>
            )}
            <div className="mt-8 flex items-center justify-center gap-3 text-sm text-purple-300 md:text-base">
              <div className="relative flex items-center justify-center">
                <div className="h-3 w-3 animate-ping rounded-full bg-green-400 opacity-75 absolute"></div>
                <div className="h-3 w-3 animate-pulse rounded-full bg-green-400 shadow-lg shadow-green-400/50 relative"></div>
              </div>
              <div className="font-medium tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
                Hackfest Timer Running
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;
