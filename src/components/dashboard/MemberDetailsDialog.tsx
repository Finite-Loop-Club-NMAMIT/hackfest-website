import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/utils/api";
import { Mail, Phone, School, BookOpen, Map, Shirt, Github } from "lucide-react";
import { Separator } from "~/components/ui/separator";

type MemberDetailsProps = {
  isOpen: boolean;
  onClose: () => void;
  teamId: string | null;
};

type MemberWithCollege = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  phone: string | null;
  isLeader: boolean;
  course: string | null;
  tShirtSize: string;
  state: string | null;
  github: string | null;
  College: {
    name: string;
    state: string;
  } | null;
};

export default function MemberDetailsDialog({
  isOpen,
  onClose,
  teamId,
}: MemberDetailsProps) {
  const {
    data: members,
    isLoading,
    error,
  } = api.team.getTeamMembersDetails.useQuery(
    { teamId: teamId ?? "" },
    { enabled: !!teamId && isOpen }
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Team Members</DialogTitle>
          <p className="text-muted-foreground text-sm">
            Detailed information about all team members
          </p>
          <Separator className="my-2" />
        </DialogHeader>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-full h-48" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center bg-red-50 rounded-lg border border-red-100">
            <p className="text-red-500 font-medium">Error loading member details</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {members?.map((member: MemberWithCollege) => (
              <Card key={member.id} className="overflow-hidden transition-all hover:shadow-md">
                <CardHeader className={`py-4 ${member.isLeader ? "bg-primary/10" : "bg-muted/50"}`}>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 ring-2 ring-background">
                      <AvatarImage src={member.image ?? ""} alt={member.name ?? ""} />
                      <AvatarFallback>
                        {member.name?.charAt(0) ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        {member.name}
                        {member.isLeader && (
                          <Badge variant="default" className="ml-2">Team Leader</Badge>
                        )}
                      </h3>
                      {member.College?.name && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <School className="h-3 w-3" />
                          {member.College.name}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <InfoItem 
                        icon={<Mail className="h-4 w-4" />} 
                        label="Email" 
                        value={member.email ?? "N/A"} 
                        isLink={true}
                        href={`mailto:${member.email}`}
                      />
                      
                      <InfoItem 
                        icon={<Phone className="h-4 w-4" />} 
                        label="Phone" 
                        value={member.phone ?? "N/A"} 
                        isLink={!!member.phone}
                        href={member.phone ? `tel:${member.phone}` : undefined}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <InfoItem 
                        icon={<BookOpen className="h-4 w-4" />} 
                        label="Course" 
                        value={member.course ?? "N/A"} 
                      />
                      
                      <InfoItem 
                        icon={<Shirt className="h-4 w-4" />} 
                        label="T-shirt Size" 
                        value={member.tShirtSize} 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <InfoItem 
                        icon={<Map className="h-4 w-4" />} 
                        label="State" 
                        value={member.state ?? member.College?.state ?? "N/A"} 
                      />
                      
                      <InfoItem 
                        icon={<Github className="h-4 w-4" />} 
                        label="GitHub" 
                        value={member.github ?? "N/A"} 
                        isLink={!!member.github}
                        href={member.github ? `https://github.com/${member.github}` : undefined}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

type InfoItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLink?: boolean;
  href?: string;
};

function InfoItem({ icon, label, value, isLink, href }: InfoItemProps) {
  return (
    <div className="flex flex-col space-y-1">
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </p>
      {isLink && href ? (
        <a 
          href={href} 
          target={href.startsWith("https") ? "_blank" : undefined}
          rel={href.startsWith("https") ? "noopener noreferrer" : undefined}
          className="text-sm font-medium text-primary hover:underline truncate"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm font-medium truncate">{value}</p>
      )}
    </div>
  );
}
