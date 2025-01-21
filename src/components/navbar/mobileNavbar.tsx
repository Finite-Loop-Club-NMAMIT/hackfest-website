import { useState } from "react";
import Link from "next/link";
import AuthButtons from "./authButton";
import { IoMdClose } from "react-icons/io";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { navLinks } from "~/constants";
import { useSession } from "next-auth/react";
import DashboardButton from "./dashboardButton";

export const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useSession();
  return (
    <>
      <div className="fixed right-5 top-[3.75rem] z-[60] flex items-center space-x-4 lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
          className="inline-flex items-center justify-center rounded-full p-2 text-white hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300/20"
        >
          {isOpen ? (
            <IoMdClose className="h-6 w-6" />
          ) : (
            <HiOutlineMenuAlt3 className="h-6 w-6" />
          )}
        </button>
      </div>

      <div
        className={`fixed top-28 flex w-full justify-center transition-transform duration-200 ${
          isOpen ? "z-[60] translate-y-0 mt-3" : "z-0 -translate-y-[30rem] -mt-1"
        } px-2 lg:hidden`}
      >
        <div
          className={`justify-center" z-[60] w-full flex flex-col space-y-3 rounded-xl border border-white/30 bg-white/5 bg-clip-padding py-5 backdrop-blur-lg 
               backdrop-filter hover:border-white/40 lg:hidden 
            `}
        >
          {navLinks.map((link, index) => (
            <Link
              key={index}
              href={link.url}
              onClick={() => setIsOpen(false)}
              className={`pl-4 text-center text-lg text-white underline-offset-4 hover:underline`}
            >
              {link.label}
            </Link>
          ))}

          <div className="flex w-full flex-col items-center justify-center gap-2">
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
      </div>
    </>
  );
};
