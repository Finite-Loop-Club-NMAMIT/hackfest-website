import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import NotFound from "../not-found";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { HomeIcon } from "@heroicons/react/24/outline";

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
        <main className={`dark min-h-screen bg-slate-950 p-2 text-white ${poppins.className}`}>
          <Toaster richColors expand={true} position="top-center" />
          <header className="flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center px-8">
              <Image
                src="/logos/logo.png"
                alt="Hackfest Logo"
                width={80}
                height={80}
              />
            </div>
            <Link 
              href="/"
              className="p-2 mr-12 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <HomeIcon className="w-6 h-6" />
            </Link>
          </header>
          <div className="dashboard-content">
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
