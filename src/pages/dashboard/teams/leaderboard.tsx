
import TeamLeaderboard from "~/components/dashboard/TeamLeaderboard";
import Head from "next/head";
import DashboardLayout from "~/components/layout/dashboardLayout";

const LeaderboardPage = () => {
  return (
    <>
      <Head>
        <title>Team Leaderboard - HackFest</title>
      </Head>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Team Leaderboard</h1>
        <TeamLeaderboard />
      </div>
    </>
  );
};

LeaderboardPage.getLayout = (page: React.ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default LeaderboardPage;
