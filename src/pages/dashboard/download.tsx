import { useSession } from "next-auth/react";
import React from "react";
import DashboardLayout from "~/components/layout/dashboardLayout";
import NotFound from "~/components/not-found";
import { api } from "~/utils/api";

const DownloadPage = () => {
  const confirmedQuery = api.downloadData.downloadConfirmedData.useQuery(
    undefined,
    { enabled: false },
  );
  const notConfirmedQuery = api.downloadData.downloadNotConfirmedData.useQuery(
    undefined,
    { enabled: false },
  );
  // Added new query for users with no team
  const noTeamQuery = api.downloadData.downloadNoTeamData.useQuery(undefined, {
    enabled: false,
  });

  // Function to download CSV from base64 data
  const downloadCsv = (base64Csv: string, filename: string) => {
    const csv = atob(base64Csv);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadConfirmed = async () => {
    const result = await confirmedQuery.refetch();
    if (result.data?.csv) {
      downloadCsv(result.data.csv, "confirmed-data.csv");
    }
  };

  const handleDownloadNotConfirmed = async () => {
    const result = await notConfirmedQuery.refetch();
    if (result.data?.csv) {
      downloadCsv(result.data.csv, "not-confirmed-data.csv");
    }
  };

  // Added new function to handle download of no team data.
  const handleDownloadNoTeam = async () => {
    const result = await noTeamQuery.refetch();
    if (result.data?.csv) {
      downloadCsv(result.data.csv, "no-team-data.csv");
    }
  };

  const { data: session } = useSession();

  if (session?.user.role === "ADMIN") {
    <DashboardLayout>
      return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
        <h1 className="mb-8 text-4xl font-bold text-white">
          Download CSV Data
        </h1>
        <div className="flex flex-col gap-4">
          <button
            onClick={handleDownloadConfirmed}
            className="rounded bg-white px-6 py-3 font-semibold text-blue-600 shadow transition hover:bg-blue-100"
          >
            Download Confirmed Data
          </button>
          <button
            onClick={handleDownloadNotConfirmed}
            className="rounded bg-white px-6 py-3 font-semibold text-blue-600 shadow transition hover:bg-blue-100"
          >
            Download Not Confirmed Data
          </button>
          {/* Added new button for users with no team */}
          <button
            onClick={handleDownloadNoTeam}
            className="rounded bg-white px-6 py-3 font-semibold text-blue-600 shadow transition hover:bg-blue-100"
          >
            Download No Team Data
          </button>
        </div>
      </div>
      );
    </DashboardLayout>;
  } else {
    <NotFound />;
  }
};

export default DownloadPage;
