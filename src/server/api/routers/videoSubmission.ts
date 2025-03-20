import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const videoRouter = createTRPCRouter({
  addVideoLink: protectedProcedure
    .input(
      z.object({
        videoLink: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.isLeader) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only team leaders can submit video links",
        });
      }

      if (!ctx.session.user.team) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not part of a team",
        });
      }

      const team = await ctx.db.team.findFirst({
        where: { id: ctx.session.user.team.id },
      });

      if (!team) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Team not found",
        });
      }

      try {
        await ctx.db.videoSubmissions
          .create({
            data: {
              url: input.videoLink,
              Team: {
                connect: {
                  id: team.id,
                },
              },
            },
          });
          
        // Log the successful video submission
        await ctx.db.auditLog.create({
          data: {
            sessionUser: ctx.session.user.email,
            auditType: "VIDEO_SUBMISSION",
            description: `Team ${team.id} has submitted a video link`,
          },
        });
        
        return { success: true };
      } catch (error) {
        console.log(error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Video link can only be submitted once per team",
        });
      }
    }),

  isVideoSubmitted: protectedProcedure.query(async ({ ctx }) => {
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
      where: { id: ctx.session.user.team.id },
    });

    if (!team) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Team not found",
      });
    }

    const videoSubmission = await ctx.db.videoSubmissions.findFirst({
      where: { teamId: team.id },
    });

    return !!videoSubmission;
  }),
});
