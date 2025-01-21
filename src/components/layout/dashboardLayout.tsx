import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import NotFound from "../not-found";
import ProgressBarProvider from "../progressBarProvider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import DashboardButton from "../navbar/dashboardButton";

const obscura = localFont({
  src: "../../../public/fonts/camera-obscura.otf",
  display: "swap",
  variable: "--font-obscura",
});

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
  const pathname = router.pathname;

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
