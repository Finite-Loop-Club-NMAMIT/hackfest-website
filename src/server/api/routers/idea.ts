import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { submitIdeaZ } from "~/server/schema/zod-schema";

export const ideaRouter = createTRPCRouter({
  submitIdea: protectedProcedure
    .input(submitIdeaZ)
    .mutation(async ({ input, ctx }) => {
      try {
        const user = ctx.session.user;
        if (!user?.isLeader)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only leader may submit the idea",
          });

        const team = await ctx.db.team.findUnique({
          where: {
            id: user.team?.id,
          },
          include: {
            IdeaSubmission: true,
          },
        });
        if (!team?.isComplete)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Team not complete!",
          });

        if (team?.IdeaSubmission)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Idea already submitted",
          });

        await ctx.db.team.update({
          data: {
            IdeaSubmission: {
              create: {
                pptUrl: input.pptUrl,
                track: input.track,
              },
            },
            Members: {
              updateMany: {
                where: {
                  teamId: user.team?.id,
                },
                data: {
                  profileProgress: "COMPLETE",
                },
              },
            },
          },
          where: {
            id: user.team?.id,
          },
        });
        return { status: "success", message: "Idea has been submitted" };
      } catch (error) {
        console.log(error);
        if (error instanceof TRPCError && error.code === "BAD_REQUEST")
          throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
});
