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
import SelectionWindow from "~/components/dashboard/selectionWindow";
import Top60Payments from "~/components/dashboard/Payments";

export default function Organiser() {
  const users = api.user.getAllUsers.useQuery().data;
  const [activeTab, setActiveTab] = useState("teams");
  const { data, status } = useSession();

  // Initialize activeTab from localStorage when the component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTab = localStorage.getItem("organiserActiveTab");
      if (
        storedTab &&
        ["teams", "analytics", "roles", "quickboard"].includes(storedTab)
      ) {
        setActiveTab(storedTab);
      }
    }
  }, []);

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("organiserActiveTab", activeTab);
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
    <div className="my-5 w-full">
      {/* Custom Tabs Navigation */}
      <div className="flex flex-row items-center justify-center border-b">
        <button
          onClick={() => setActiveTab("quickboard")}
          className={`w-full px-4 py-2 text-center transition-colors ${
            activeTab === "quickboard"
              ? "border-b-2 border-purple-500 font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Quickboard
        </button>
        <button
          onClick={() => setActiveTab("teams")}
          className={`w-full px-4 py-2 text-center transition-colors ${
            activeTab === "teams"
              ? "border-b-2 border-purple-500 font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Teams
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`w-full px-4 py-2 text-center transition-colors ${
            activeTab === "analytics"
              ? "border-b-2 border-purple-500 font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`w-full px-4 py-2 text-center transition-colors ${
            activeTab === "roles"
              ? "border-b-2 border-purple-500 font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Roles
        </button>
        <button
          onClick={() => setActiveTab("selectionwindow")}
          className={`w-full px-4 py-2 text-center transition-colors ${
            activeTab === "selectionwindow"
              ? "border-b-2 border-purple-500 font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Selection Window
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`w-full px-4 py-2 text-center transition-colors ${
            activeTab === "payments"
              ? "border-b-2 border-purple-500 font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Payments
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "quickboard" && <QuickboardTab />}
      {activeTab === "teams" && <TeamsTab />}
      {activeTab === "analytics" && <AnalyticsTab />}
      {activeTab === "roles" && <RolesTab users={users} />}
      {activeTab === "selectionwindow" && <SelectionWindow />}
      {activeTab === "payments" && <Top60Payments />}
    </div>
  );
}
