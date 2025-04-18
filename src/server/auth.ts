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
import type { PaymentStatus, Progress, Role, TeamProgress } from "@prisma/client";

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
            teamProgress: TeamProgress;
            paymentStatus: PaymentStatus;
            attended: boolean;
          }
        | null
        | undefined;
      college: string;
      isLeader: boolean;
      isGameLeader: boolean;
      phone: string;
      role: Role;
      profileProgress: Progress;
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
          Team: { include: { IdeaSubmission: true } },
          College: true,
        },
      });
      if (!dbUser) {
        throw new Error("User not found");
      }
      session.user.id = dbUser.id;
      session.user.role = dbUser.role;
      if (dbUser.Team) {
        const team = {
          id: dbUser?.Team?.id,
          name: dbUser?.Team?.name,
          isComplete: dbUser?.Team?.isComplete,
          ideaSubmission: dbUser?.Team?.IdeaSubmission?.pptUrl,
          teamProgress: dbUser?.Team?.teamProgress,
          paymentStatus: dbUser?.Team?.paymentStatus,
          attended: dbUser.Team.attended
        };
        session.user.team = team;
      } else session.user.team = null;
      session.user.college = dbUser.College?.name ?? "";
      session.user.isLeader = dbUser?.isLeader;
      session.user.phone = dbUser?.phone ?? "";
      session.user.profileProgress = dbUser?.profileProgress;

      return session;
    },
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
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
