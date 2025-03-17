import { useRouter } from "next/router";
import { useState, useEffect, createElement } from "react";
import { 
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { FaBook, FaUserEdit } from "react-icons/fa";
import { FaUsers } from "react-icons/fa6";
import { MdAdminPanelSettings } from "react-icons/md";

type DashboardButtonProps = {
  role: string;
};

const menuItems = [
  { path: "/dashboard/attendance", label: "Attendance", icon: FaBook },
  { path: "/dashboard/team", label: "Team", icon: FaUsers },
  { path: "/dashboard/organiser", label: "Organiser", icon: MdAdminPanelSettings },
  { path: "/dashboard/validator", label: "Validator", icon: FaUserEdit },
];

export default function DashboardButton({ role }: DashboardButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleNavigation = async (path: string) => {
    try {
      await router.push(path);
      setIsOpen(false);
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside the menu area
      if (isOpen && !target.closest('[data-menu-area]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);
  
  return (
    <div className="relative" data-menu-area>
      {/* Main button trigger for all devices */}
      {role !== "PARTICIPANT" && (
        <button 
          onClick={async (e) => {
            e.stopPropagation();
            if (role === "ADMIN") {
              setIsOpen(!isOpen);
            } else if (role === "JUDGE") {
              try {
                await router.push("/dashboard/judge");
              } catch (error) {
                console.error('Navigation failed:', error);
              }
            }
            else if (role === "VALIDATOR") {
              try {
                await router.push("/dashboard/validator");
              } catch (error) {
                console.error('Navigation failed:', error);
              }
            }
            else if (role === "TEAM") {
              try {
                await router.push("/dashboard/team");
              } catch (error) {
                console.error('Navigation failed:', error);
              }
            }
            else if (role === "SUPER_VALIDATOR") {
              try {
                await router.push("/dashboard/super-validator");
              } catch (error) {
                console.error('Navigation failed:', error);
              }
            }
          }}
          className="relative z-50 flex items-center justify-center p-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg transition-all duration-300 hover:shadow-purple-500/20 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          aria-label="Toggle navigation menu"
        >
          <div className="w-6 h-6 relative flex flex-col items-center justify-center">  
            <span className={`block absolute h-0.5 w-6 bg-white transform transition duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-1.5' : '-translate-y-1'}`}></span>
            <span className={`block absolute h-0.5 bg-white transform transition duration-300 ease-in-out ${isOpen ? 'w-0 opacity-0' : 'w-6 opacity-100'}`}></span>
            <span className={`block absolute h-0.5 w-6 bg-white transform transition duration-300 ease-in-out ${isOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-1'}`}></span>
          </div>
        </button>
      )}

      {/* Menu overlay and items - optimized for all devices */}
      {isOpen && (
        <div className="fixed inset-0 z-40" data-menu-area>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu items in a straight line */}
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
            <div className="flex flex-col items-center">
              {/* Navigation buttons in a straight line */}
              <div className="flex flex-row items-center justify-center space-x-4 mb-8">
                {role === "ADMIN" && menuItems.map((item, index) => (
                  <div 
                    key={item.path}
                    className="transition-all duration-300"
                    style={{
                      opacity: 0,
                      animation: `fadeInSlideUp 0.3s ease-out ${index * 0.1}s forwards`
                    }}
                  >
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className="group flex flex-col items-center justify-center p-3 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 shadow-lg transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      aria-label={item.label}
                    >
                      {createElement(item.icon, { className: "h-5 w-5 text-white" })}
                      <span className="absolute whitespace-nowrap opacity-0 group-hover:opacity-100 bottom-full mb-2 text-xs sm:text-sm font-medium text-white bg-slate-800/80 px-2 py-1 rounded-lg transition-opacity">
                        {item.label}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Logout button below the navigation buttons */}
              <div 
                className="transition-all duration-300"
                style={{
                  opacity: 0,
                  animation: `fadeInSlideUp 0.3s ease-out 0.4s forwards`
                }}
              >
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="group flex flex-col items-center justify-center p-3 rounded-full bg-gradient-to-r from-red-700 to-orange-700 hover:from-red-600 hover:to-orange-600 shadow-lg transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400"
                  aria-label="Sign out"
                >
                  <LogOut className="h-5 w-5 text-white" />
                  <span className="absolute whitespace-nowrap opacity-0 group-hover:opacity-100 bottom-full mb-2 text-xs sm:text-sm font-medium text-white bg-slate-800/80 px-2 py-1 rounded-lg transition-opacity">
                    Sign Out
                  </span>
                </button>
              </div>
            </div>
          </div>

          <style jsx>{`
            @keyframes fadeInSlideUp {
              0% {
                opacity: 0;
                transform: translateY(10px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
