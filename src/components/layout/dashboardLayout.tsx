import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import NotFound from "../not-found";
import { useSession } from "next-auth/react";
import DashboardButton from "../navbar/dashboardButton";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
  const router = useRouter();
  const [key, setKey] = useState(0);
  
  // Force re-render when route changes
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [router.asPath]);

  if (user !== null) {
    if (user?.data?.user.role !== "PARTICIPANT") {
      return (
        <main
          className={`dark min-h-screen bg-slate-950 p-2 text-white ${poppins.className}`}
        >
          <Toaster richColors expand={true} position="top-center" />
          <div className="flex w-full py-4 justify-center items-center">
            <DashboardButton role={user?.data?.user.role ?? 'PARTICIPANT'} currentPath={router.asPath} />
          </div>
          <div key={key} className="dashboard-content">
            {children}
          </div>
        </main>
      );
    } else {
      return <NotFound />;
    }
  } else {
    return <NotFound />;
  }
}
