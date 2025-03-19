import Analytics from "~/components/organiserDashboard/analytics";

export default function AnalyticsTab() {
  return (
    <div>
      <div className="w-full">
        <h1 className="py-10 text-center text-4xl font-bold">Analytics Dashboard</h1>
      </div>
      <div className="w-full py-12">
        <Analytics />
      </div>
    </div>
  );
}
