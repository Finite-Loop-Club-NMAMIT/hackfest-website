import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DashboardLayout from "~/components/layout/dashboardLayout";
import NotFound from "../404";
import Spinner from "~/components/spinner";
import Validator from "./validator";
import Organiser from "./organiser";
import TeamAttendance from "./team";
import SuperVaildator from "./super-validator";
import Judge from "./judge";
import { CountdownTimer } from "~/components/CountdownTimer";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [internetTime, setInternetTime] = useState<Date | null>(null);
  const [isLoadingTime, setIsLoadingTime] = useState(true);

  // Function to fetch internet time
  const fetchInternetTime = async () => {
    try {
      setIsLoadingTime(true);
      const response = await fetch('https://worldtimeapi.org/api/ip');
      const data = await response.json() as { datetime: string };
      const datetime = new Date(data.datetime);
      setInternetTime(datetime);
      setCurrentTime(datetime);
      setIsLoadingTime(false);
    } catch (error) {
      console.error("Error fetching internet time:", error);
      setCurrentTime(new Date());
      setIsLoadingTime(false);
    }
  };

  // Initial fetch of internet time
  useEffect(() => {
    void fetchInternetTime();
    const syncInterval = setInterval(() => {
      void fetchInternetTime();
    }, 60000);
    return () => clearInterval(syncInterval);
  }, []);

  // Update the time every second based on the last sync
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(prev => new Date(prev.getTime() + 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get available tabs based on user role
  const getAvailableTabs = () => {
    if (!session?.user?.role) return [];
    
    switch (session.user.role) {
      case "ADMIN":
        return ["organiser", "team", "validator", "superValidator"];
      case "VALIDATOR":
        return ["validator"];
      case "SUPER_VALIDATOR":
        return ["superValidator"];
      case "TEAM":
        return ["team"];
      default:
        return [];
    }
  };

  // Get default tab based on user role
  const getDefaultTab = () => {
    if (!session?.user?.role) return "";
    
    switch (session.user.role) {
      case "ADMIN":
        return "organiser";
      case "VALIDATOR":
        return "validator";
      case "SUPER_VALIDATOR":
        return "superValidator";
      case "TEAM":
        return "team";
      case "JUDGE":
        return "judge"; // Assuming judge is a valid tab for judges
      default:
        return "";
    }
  };

  // Set initial active tab based on role and query
  useEffect(() => {
    const tabs = getAvailableTabs();
    const queryTab = router.query.tab as string;
    const defaultTab = getDefaultTab();
    
    if (queryTab && tabs.includes(queryTab)) {
      setActiveTab(queryTab);
    } else {
      setActiveTab(defaultTab);
      void router.push({
        pathname: '/dashboard',
        query: { tab: defaultTab }
      }, undefined, { shallow: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, router.query.tab]);

  const handleTabChange = (tab: string) => {
    void router.push({
      pathname: '/dashboard',
      query: { tab }
    }, undefined, { shallow: true });
    setActiveTab(tab);
  };

  if (status === "loading") {
    return (
        <div className="flex h-screen items-center justify-center">
          <Spinner />
        </div>
    );
  }

  if (!session?.user || session.user.role === "PARTICIPANT") {
    return <NotFound />;
  }

  const availableTabs = getAvailableTabs();

  return (
    <DashboardLayout>
      <div className="max-w-[100vw] overflow-x-hidden">
        {/* Enhanced Google-style Clock with Internet Time and Countdown */}
        <div className="flex justify-center items-center gap-4 mb-8 flex-wrap">
          <div className="rounded-2xl shadow-lg p-6 backdrop-blur-lg min-w-[320px]">
            {isLoadingTime ? (
              <div className="flex flex-col items-center justify-center">
                <div className="text-xl text-gray-400 mb-1">Fetching internet time...</div>
                <Spinner />
              </div>
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-200 mb-1">
                  {currentTime.toLocaleDateString([], { weekday: 'long' })}
                </div>
                <div className="text-5xl font-bold text-white mb-2 tracking-wider">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </div>
                <div className="text-xl font-medium text-gray-300 mb-2">
                  {currentTime.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-purple-400 mt-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  {internetTime ? 
                    "Internet Time • Last synced: " + new Date(internetTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true}) : 
                    "Using local time"
                  }
                </div>
              </div>
            )}
          </div>
          <CountdownTimer />
        </div>

        {availableTabs.length > 1 && (
          <div className="relative mb-6 border-b">
            <div className="flex overflow-x-auto no-scrollbar items-center justify-start md:justify-center">
              {availableTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`whitespace-nowrap flex-shrink-0 py-2 px-4 text-center transition-colors ${
                    activeTab === tab
                      ? "border-b-2 border-purple-500 font-bold"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab[0]?.toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          {activeTab === "team" && <TeamAttendance />}
          {activeTab === "organiser" && <Organiser />}
          {activeTab === "validator" && <Validator />}
          {activeTab === "superValidator" && <SuperVaildator />}
          {activeTab === "judge" && <Judge />}
        </div>
      </div>
    </DashboardLayout>
  );
}
