import { PrismaAdapter } from "@auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import { env } from "~/env";
import { db } from "~/server/db";
import type { GameTeam, Progress, Role, TeamProgress } from "@prisma/client";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      team:
        | {
            id: string;
            name: string;
            isComplete: boolean;
            ideaSubmission: string | undefined;
            teamProgress : TeamProgress
          }
        | null
        | undefined;
      college: string;
      isLeader: boolean;
      isGameLeader: boolean;
      phone: string;
      role: Role;
      profileProgress: Progress;
      gameTeam: GameTeam | null | undefined;
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    // async redirect({ url }) {
    // 	if (url.includes("/auth/error")) {
    // 		url = url.replace("/auth/error", "/profile");
    // 		url = url.replace(/\?.*/, "");
    // 	}
    // 	return url;
    // },
    async session({ session }) {
      const dbUser = await db.user.findUnique({
        where: {
          email: session.user.email!,
        },
        include: {
          team: { include: { ideaSubmission: true } },
          college: true,
          gameTeam: true,
        },
      });
      if (!dbUser) {
        throw new Error("User not found");
      }
      session.user.id = dbUser.id;
      session.user.role = dbUser.role;
      if (dbUser.team) {
        const team = {
          id: dbUser?.team?.id,
          name: dbUser?.team?.name,
          isComplete: dbUser?.team?.isComplete,
          ideaSubmission: dbUser?.team?.ideaSubmission?.pptUrl,
          teamProgress: dbUser?.team?.teamProgress,
        };
        session.user.team = team;
      } else session.user.team = null;
      session.user.college = dbUser.college?.name ?? "";
      session.user.isLeader = dbUser?.isLeader;
      session.user.phone = dbUser?.phone ?? "";
      session.user.profileProgress = dbUser?.profileProgress;
      session.user.gameTeam = dbUser?.gameTeam;
      session.user.isGameLeader = dbUser?.isGameLeader;
      
      return session;
    },
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
