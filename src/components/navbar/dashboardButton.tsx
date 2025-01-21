import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import Link from "next/link";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { type Role } from "@prisma/client";
import { Card, CardContent } from "../ui/card";
import { api } from "~/utils/api";
export default function DashboardButton({ role }: { role: Role }) {
  const [dashboards, setDashboards] = useState<string[]>([]);
 
  useEffect(() => {
    if (role) {
      if (role === "ADMIN") {
        setDashboards([
          "admin",
          "attendance",
          "team",
          "organiser",
          "validator",
        ]);
      } else if (role === "TEAM") {
        setDashboards(["team", "attendance"]);
      } else if (role === "ORGANISER") {
        setDashboards(["organiser", "attendance"]);
      } else if (role === "VALIDATOR") {
        setDashboards(["validator"]);
      } else if (role === "JUDGE") {
        setDashboards(["judge"]);
      }
    }
  }, [role]);

  return (
    <>
      {dashboards.length > 1 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button>Dashboard</Button>
          </PopoverTrigger>
          <PopoverContent sideOffset={10} className="z-50">
            <Card>
              <CardContent className="pt-6">
                <div className="flex w-full flex-col gap-2 ">
                  {dashboards.map((item, index) => (
                    <Link href={`/dashboard/${item}`} key={index}>
                      <Button className="dark w-full">
                        {item[0]?.toUpperCase() + item.slice(1)}
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      )}
      {dashboards.length === 0 && (
        <Link href={`/results`}>
          <Button>Results</Button>
        </Link>
      )}
      {dashboards.length === 1 && (
        <Link href={`/dashboard/${role?.toLowerCase()}`}>
          <Button>Dashboard</Button>
        </Link>
      )}
    </>
  );
}
