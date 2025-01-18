import type { College, Team, User, IdeaSubmission } from "@prisma/client";

export type members = User & { College: College | null };
export type TeamsData = Team & {
  Members: members[];
} & { IdeaSubmission: IdeaSubmission | null };
