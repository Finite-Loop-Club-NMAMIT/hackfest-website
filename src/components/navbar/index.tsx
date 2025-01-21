import Image from "next/image";
import Link from "next/link";
import AuthButtons from "./authButton";
import { MobileNavbar } from "./mobileNavbar";
import { navLinks } from "~/constants";
import { useSession } from "next-auth/react";
import { Button } from "../ui/button";
import DashboardButton from "./dashboardButton";

const Navbar = () => {
  const user = useSession();
  return (
    <div className="mx-3 flex justify-center">
      <nav className="fixed z-[60] mt-3 w-full max-w-6xl rounded-full border  border-white/30 bg-white/5 bg-clip-padding px-5 backdrop-blur-lg backdrop-filter sm:mt-5">
        <div className="flex h-16 items-center justify-between px-4">
          <Link
            href={"/"}
            className="flex items-center gap-3 font-semibold text-white"
          >
            <div className="lg:w-30 lg:h-30">
              <Image
                className="w-auto "
                src="/logos/logo.png"
                priority
                alt="Logo - Hackfest"
                width={50}
                height={50}
              />
            </div>
          </Link>

          <div className="hidden items-center space-x-8 lg:flex">
            {navLinks.map((link, index) => (
              <div key={index} className="group relative">
                <Link
                  href={link.url}
                  className={`text-white hover:text-gray-300`}
                >
                  {link.label}
                </Link>
              </div>
            ))}
          </div>

          <div className="hidden  gap-2 lg:flex">
            <AuthButtons />
            {user?.data?.user && user?.data?.user?.role !== "PARTICIPANT" && (
              // <Link href={`/dashboard/${user?.data?.user?.role.toLowerCase()}`}>
              //   <Button>
              //     Dashboard
              //   </Button>
              // </Link>
              <DashboardButton role={user?.data?.user?.role} />
            )}
          </div>
        </div>
      </nav>
      <MobileNavbar />
    </div>
  );
};

export default Navbar;
