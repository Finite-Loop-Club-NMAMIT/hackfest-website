import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import NotFound from "../not-found";
import { useSession } from "next-auth/react";
import DashboardButton from "../navbar/dashboardButton";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"] });

const metadata = {
  title: "Hackfest - Dashboard",
  description: "Dashboard",
  icons: {
    icon: "/favicons/favicon.ico",
    shortcut: "/favicons/favicon.ico",
    apple: "/favicons/apple-touch-icon.png",
  },
};

export { metadata };

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useSession();

  if (user !== null) {
    if (user?.data?.user.role !== "PARTICIPANT") {
      return (
        <main
          className={`dark min-h-screen bg-slate-950 p-2 text-white ${poppins.className}`}
        >
          <Toaster richColors expand={true} position="top-center" />
          {
            user?.data?.user.role === "ADMIN" ? (
              <div className="flex w-full py-4 justify-center items-center">
          <DashboardButton role={user?.data?.user.role ?? 'PARTICIPANT'} />
          </div>
            ): null
          }
          {children}
        </main>
      );
    } else {
      return <NotFound />;
    }
  } else {
    return <NotFound />;
  }
}
