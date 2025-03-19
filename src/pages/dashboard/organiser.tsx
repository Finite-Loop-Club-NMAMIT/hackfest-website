import DashboardLayout from "~/components/layout/dashboardLayout";
import { api } from "~/utils/api";
import { useEffect, useState } from "react";
import Spinner from "~/components/spinner";
import { useSession } from "next-auth/react";
import NotFound from "../404";
import QuickboardTab from "~/components/dashboard/QuickboardTab";
import TeamsTab from "~/components/dashboard/TeamsTab";
import AnalyticsTab from "~/components/dashboard/AnalyticsTab";
import RolesTab from "~/components/dashboard/RolesTab";

export default function Organiser() {
  const users = api.user.getAllUsers.useQuery().data;
  const [activeTab, setActiveTab] = useState("teams");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [internetTime, setInternetTime] = useState<Date | null>(null);
  const [isLoadingTime, setIsLoadingTime] = useState(true);
  const { data, status } = useSession();

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
      // Fallback to local time if internet time fetch fails
      setCurrentTime(new Date());
      setIsLoadingTime(false);
    }
  };

  // Initial fetch of internet time
  useEffect(() => {
    void fetchInternetTime();
    
    // Set up interval to periodically sync with internet time (every minute)
    const syncInterval = setInterval(() => {
      void fetchInternetTime();
    }, 60000); // Sync with internet time every minute
    
    return () => clearInterval(syncInterval);
  }, []);

  // Update the time every second based on the last sync
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(prev => new Date(prev.getTime() + 1000));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Initialize activeTab from localStorage when the component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTab = localStorage.getItem('organiserActiveTab');
      if (storedTab && ['teams', 'analytics', 'roles', 'quickboard'].includes(storedTab)) {
        setActiveTab(storedTab);
      }
    }
  }, []);

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('organiserActiveTab', activeTab);
    }
  }, [activeTab]);

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner />
        </div>
      </DashboardLayout>
    );
  }

  if (!data || !data.user || data.user.role !== "ADMIN") {
    return <NotFound />;
  }

  return (
    <DashboardLayout>
      <div className="w-full my-5">
        {/* Enhanced Google-style Clock with Internet Time */}
        <div className="flex justify-center items-center mb-8">
          <div className="rounded-2xl shadow-lg p-6 backdrop-blur-lg min-w-[320px]">
            {isLoadingTime ? (
              <div className="flex flex-col items-center justify-center">
                <div className="text-xl text-gray-400 mb-1">Fetching internet time...</div>
                <Spinner />
              </div>
            ) : (
              <div className="text-center">
                {/* Day of the week - larger display */}
                <div className="text-2xl font-bold text-gray-200 mb-1">
                  {currentTime.toLocaleDateString([], { weekday: 'long' })}
                </div>
                
                {/* Time display */}
                <div className="text-5xl font-bold text-white mb-2 tracking-wider">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </div>
                
                {/* Date display - larger and more prominent */}
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
        </div>

        {/* Custom Tabs Navigation */}
        <div className="flex flex-row items-center justify-center border-b">
          <button
            onClick={() => setActiveTab("quickboard")}
            className={`w-full py-2 px-4 text-center transition-colors ${
              activeTab === "quickboard" 
                ? "border-b-2 border-purple-500 font-bold" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            Quickboard
          </button>
          <button
            onClick={() => setActiveTab("teams")}
            className={`w-full py-2 px-4 text-center transition-colors ${
              activeTab === "teams" 
                ? "border-b-2 border-purple-500 font-bold" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            Teams
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full py-2 px-4 text-center transition-colors ${
              activeTab === "analytics" 
                ? "border-b-2 border-purple-500 font-bold" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`w-full py-2 px-4 text-center transition-colors ${
              activeTab === "roles" 
                ? "border-b-2 border-purple-500 font-bold" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            Roles
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "quickboard" && <QuickboardTab />}
        {activeTab === "teams" && <TeamsTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "roles" && <RolesTab users={users} />}
      </div>
    </DashboardLayout>
  );
}
