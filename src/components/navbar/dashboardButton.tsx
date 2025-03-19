import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { type Role } from "@prisma/client";
import { Card, CardContent } from "../ui/card";

export default function DashboardButton({ role, currentPath }: { role: Role, currentPath?: string }) {
  const [dashboards, setDashboards] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (role) {
      if (role === "ADMIN") {
        setDashboards([
          "attendance",
          "team",
          "organiser",
          "validator",
        ]);
      } else if (role === "TEAM") {
        setDashboards(["team", "attendance"]);
      } else if (role === "VALIDATOR") {
        setDashboards(["validator"]);
      } else if (role === "JUDGE") {
        setDashboards(["judge"]);
      }
    }
  }, [role]);

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    
    // Force a full page refresh by using window.location
    if (path !== currentPath) {
      window.location.href = path;
    }
  };

  return (
    <>
      {dashboards.length > 1 && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button>Dashboard</Button>
          </PopoverTrigger>
          <PopoverContent sideOffset={10} className="z-50">
            <Card>
              <CardContent className="pt-6">
                <div className="flex w-full flex-col gap-2 ">
                  {dashboards.map((item, index) => (
                    <Button 
                      key={index} 
                      className="dark w-full"
                      onClick={() => handleNavigation(`/dashboard/${item}`)}
                    >
                      {item[0]?.toUpperCase() + item.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      )}
      {dashboards.length === 1 && (
        <Button onClick={() => handleNavigation(`/dashboard/${dashboards[0]}`)}>
          Dashboard
        </Button>
      )}
    </>
  );
}
