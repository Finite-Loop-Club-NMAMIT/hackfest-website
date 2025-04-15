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
import AllocationTab from "~/components/dashboard/AllocationTab";
import AuditLogViewer from "~/components/organiser/AuditLogViewer"; 
import JuryTab from "~/components/dashboard/JuryTab";
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
        ["teams", "analytics", "roles", "quickboard", "allocations", "selectionwindow", "payments", "auditlog", "jury"].includes(storedTab) // Add "jury" here
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
      <div className="flex flex-row items-center justify-start md:justify-center border-b overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("quickboard")}
          className={`whitespace-nowrap flex-shrink-0 px-4 py-2 text-center transition-colors ${
            activeTab === "quickboard"
              ? "border-b-2 border-purple-500 font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Quickboard
        </button>
        <button
          onClick={() => setActiveTab("teams")}
          className={`whitespace-nowrap flex-shrink-0 px-4 py-2 text-center transition-colors ${
            activeTab === "teams"
              ? "border-b-2 border-purple-500 font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Teams
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`whitespace-nowrap flex-shrink-0 px-4 py-2 text-center transition-colors ${
            activeTab === "analytics"
              ? "border-b-2 border-purple-500 font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`whitespace-nowrap flex-shrink-0 px-4 py-2 text-center transition-colors ${
            activeTab === "roles"
              ? "border-b-2 border-purple-500 font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Roles & Settings
        </button>
        <button
          onClick={() => setActiveTab("allocations")}
          className={`whitespace-nowrap flex-shrink-0 px-4 py-2 text-center transition-colors ${
            activeTab === "allocations"
              ? "border-b-2 border-purple-500 font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Allocations
        </button>
        <button
          onClick={() => setActiveTab("selectionwindow")}
          className={`whitespace-nowrap flex-shrink-0 px-4 py-2 text-center transition-colors ${
            activeTab === "selectionwindow"
              ? "border-b-2 border-purple-500 font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Selection Window
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`whitespace-nowrap flex-shrink-0 px-4 py-2 text-center transition-colors ${
            activeTab === "payments"
              ? "border-b-2 border-purple-500 font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Payments
        </button>
        <button
          onClick={() => setActiveTab("auditlog")}
          className={`whitespace-nowrap flex-shrink-0 px-4 py-2 text-center transition-colors ${
            activeTab === "auditlog"
              ? "border-b-2 border-purple-500 font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Audit Log
        </button>
        {/* Add Jury Tab Button */}
        <button
          onClick={() => setActiveTab("jury")}
          className={`whitespace-nowrap flex-shrink-0 px-4 py-2 text-center transition-colors ${
            activeTab === "jury"
              ? "border-b-2 border-purple-500 font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Jury
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "quickboard" && <QuickboardTab />}
      {activeTab === "teams" && <TeamsTab />}
      {activeTab === "analytics" && <AnalyticsTab />}
      {activeTab === "roles" && <RolesTab users={users} />}
      {activeTab === "allocations" && <AllocationTab />}
      {activeTab === "selectionwindow" && <SelectionWindow />}
      {activeTab === "payments" && <Top60Payments />}
      {activeTab === "auditlog" && <AuditLogViewer />}
      {activeTab === "jury" && <JuryTab />}
    </div>
  );
}
