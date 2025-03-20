import JudgePanel from "~/components/organiserDashboard/judgePanel";
import VolunteerPanel from "~/components/organiserDashboard/volunteerPanel";
import { type User } from "@prisma/client";

interface RolesTabProps {
  users: User[] | undefined;
}

export default function RolesTab({ users }: RolesTabProps) {
  return (
    <div className="w-full px-4 max-w-full overflow-hidden">
      <div className="flex w-full flex-col md:flex-row gap-8">
        <div className="w-full md:flex-1 max-w-full">
          <JudgePanel users={users} />
        </div>
        <div className="w-full md:flex-1 max-w-full">
          <VolunteerPanel users={users} />
        </div>
      </div>
    </div>
  );
}
