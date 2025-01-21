import type {
  College,
  Team,
  User,
  IdeaSubmission,
  Referral,
} from "@prisma/client";

export type members = User & { college: College | null };
export type TeamsData = Team & {
  members: members[];
} & { ideaSubmission: IdeaSubmission | null } & { referral: Referral | null };
