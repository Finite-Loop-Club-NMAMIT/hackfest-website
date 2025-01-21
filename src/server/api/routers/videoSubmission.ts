import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const videoRouter = createTRPCRouter({
  enableVideoSubmission: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "ORGANISER") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins or organisers can enable video submission",
        });
      }

      await ctx.db.appSettings.update({
        where: { id: 1 },
        data: { isVideoSubmissionOpen: true },
      });
    }),

  disableVideoSubmission: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "ORGANISER") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins or organisers can disable video submission",
        });
      }

      await ctx.db.appSettings.update({
        where: { id: 1 },
        data: { isVideoSubmissionOpen: false },
      });
    }),

  addVideoLink: protectedProcedure
    .input(z.object({
      videoLink: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.isLeader) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only team leaders can submit video links",
        });
      }

      const appSettings = await ctx.db.appSettings.findFirst({
        where: { id: 1 }
      });

      if (!appSettings?.isVideoSubmissionOpen) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Video submission is closed",
        });
      }

      if (!ctx.session.user.team) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not part of a team",
        });
      }

      const team = await ctx.db.team.findFirst({
        where: { id: ctx.session.user.team.id }
      });

      if (!team) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Team not found",
        });
      }

      ctx.db.videoSubmissions.create({
        data: {
          url: input.videoLink,
          Team: {
            connect: {
              id: team.id
            }
          }
        }
      }).catch((error) => {
        console.log(error)

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Video link can only be submitted once per team",
        });
      });
    }),

  isVideoSubmissionOpen: protectedProcedure
    .query(async ({ ctx }) => {
      const appSettings = await ctx.db.appSettings.findFirst({
        where: { id: 1 }
      });

      return appSettings?.isVideoSubmissionOpen ?? false;
    }),

  isVideoSubmitted: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.session.user.isLeader) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only team leaders can check if video is submitted",
        });
      }

      if (!ctx.session.user.team) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not part of a team",
        });
      }

      const team = await ctx.db.team.findFirst({
        where: { id: ctx.session.user.team.id }
      });

      if (!team) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Team not found",
        });
      }

      const videoSubmission = await ctx.db.videoSubmissions.findFirst({
        where: { teamId: team.id }
      });

      return !!videoSubmission
    })
})
