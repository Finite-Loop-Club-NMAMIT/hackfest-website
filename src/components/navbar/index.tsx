import AuthButtons from "./authButton";
import { navLinks } from "~/constants";
import { useSession } from "next-auth/react";
import DashboardButton from "./dashboardButton";

import React, { useState } from "react";
import { MenuIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useSession();

  return (
    <div className="fixed  z-[9999] flex w-full justify-center pt-4">
      <nav className="relative mx-4 w-full max-w-5xl rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-950/90 to-blue-900/80 shadow-2xl shadow-blue-500/20 backdrop-blur-lg">
        <div className="relative px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/">
                <Image
                  src={"/logos/logo.png"}
                  width={100}
                  height={100}
                  alt="HFLogo"
                  className="size-16"
                />
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden items-center space-x-6 md:flex">
              {navLinks.map((item) => (
                <a key={item.label} href={item.url} className="group relative">
                  <span className="px-3 py-2 text-sm font-medium uppercase tracking-widest text-gray-300 transition-colors duration-300 hover:text-blue-300">
                    {item.label}
                  </span>
                  <span className="absolute bottom-0 left-0 h-0.5 w-full scale-x-0 transform bg-gradient-to-r from-blue-500 to-cyan-500 transition-transform duration-300 group-hover:scale-x-100" />
                </a>
              ))}
            </div>
            <div className="hidden md:flex">
              <DashboardButton role={user.data?.user.role ?? "PARTICIPANT"} />
              <AuthButtons />
            </div>

            {/* Mobile Nav toggle */}
            <div className="flex gap-2 md:hidden">
              <AuthButtons />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative p-2"
              >
                <div className="absolute inset-0 scale-0 rounded-lg bg-blue-500/20 transition-transform duration-300 group-hover:scale-100" />
                {isOpen ? (
                  <XIcon className="relative h-6 w-6 text-blue-400" />
                ) : (
                  <MenuIcon className="relative h-6 w-6 text-blue-400" />
                )}
              </button>
            </div>
          </div>
          {/* Mobile Panel */}
          {isOpen && (
            <div className="mt-4 border-t border-blue-500/30 md:hidden">
              <div className="space-y-2 py-4">
                {navLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.url}
                    className="block rounded-lg px-4 py-2 text-sm font-medium uppercase tracking-widest text-gray-300 transition-colors duration-300 hover:bg-blue-800/50"
                  >
                    {item.label}
                  </a>
                ))}

                <DashboardButton role={user.data?.user.role ?? "PARTICIPANT"} />
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
