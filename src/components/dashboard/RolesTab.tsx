import JudgePanel from "~/components/organiserDashboard/judgePanel";
import VolunteerPanel from "~/components/organiserDashboard/volunteerPanel";
import { type User } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface RolesTabProps {
  users: User[] | undefined;
}

export default function RolesTab({ users }: RolesTabProps) {
  return (
    <div className="w-full px-4 md:px-0 max-w-full overflow-x-hidden">
      <Card className="w-full max-w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Roles Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="judges" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="judges">Judges</TabsTrigger>
              <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="judges" className="w-full">
              <Card className="w-full">
                <CardContent className="pt-6 w-full p-0 sm:p-6">
                  <JudgePanel users={users} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="volunteers" className="w-full">
              <Card className="w-full">
                <CardContent className="pt-6 w-full p-0 sm:p-6">
                  <VolunteerPanel users={users} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
