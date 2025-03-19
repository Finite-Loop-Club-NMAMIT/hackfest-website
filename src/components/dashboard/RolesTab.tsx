import JudgePanel from "~/components/organiserDashboard/judgePanel";
import VolunteerPanel from "~/components/organiserDashboard/volunteerPanel";
import { type User } from "@prisma/client";

interface RolesTabProps {
  users: User[] | undefined;
}

export default function RolesTab({ users }: RolesTabProps) {
  return (
    <div className="w-full px-4">
      <div className="flex w-full gap-8">
        <div className="flex-1">
          <JudgePanel users={users} />
        </div>
        <div className="flex-1">
          <VolunteerPanel users={users} />
        </div>
      </div>
    </div>
  );
}
