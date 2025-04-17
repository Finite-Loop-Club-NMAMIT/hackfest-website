import { useEffect, useState } from "react";
import Spinner from "./spinner";
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
    <div className="rounded-2xl shadow-lg p-6 backdrop-blur-lg min-w-[320px]">
      {!appSettings ? (
        <div className="flex flex-col items-center justify-center">
          <div className="text-xl text-gray-400 mb-1">Loading...</div>
          <Spinner />
        </div>
      ) : (
        <div className="text-center">
          <div className="text-md font-bold text-gray-200 mb-1">
            Time Remaining
          </div>
          <div className="text-5xl font-bold text-white mb-2 tracking-wider">
            {timeLeft}
          </div>
          {appSettings?.isHackfestStarted && (
            <div className="text-xl font-medium text-gray-300 mb-2">
              Elapsed Time : {elapsedTime}
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-xs text-purple-400 mt-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            Hackfest Timer
          </div>
        </div>
      )}
    </div>
  );
};

export default CountdownTimer;
