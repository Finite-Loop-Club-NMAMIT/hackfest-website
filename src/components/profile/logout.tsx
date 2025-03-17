import type { FC } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";

export const LogoutButton: FC = () => {
  const path = usePathname();

  return (
    <Button
      variant="outline"
      onClick={() => signOut()}
      className="flex items-center gap-2 bg-red-600 hover:bg-red-600/90"
    >
      <LogOut size={16} />
      {path !== "/register" ? "Logout" : ""}
    </Button>
  );
};
