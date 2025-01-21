import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const superValidatorRouter = createTRPCRouter({
  getTop100: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role === "PARTICIPANT")
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not an validator",
      });
    try {
      const user = ctx.session.user;
      const judge = await ctx.db.judges.findFirst({
        where: {
          userId: user.id,
        },
      });
      //condition to change incase db push is not possible
      if (!judge || judge?.type !== "SUPER_VALIDATOR")
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not a super-validator!",
        });
      const getTop100 = await ctx.db.team.findMany({
        where: {
          OR: [{ teamProgress: "SEMI_SELECTED" }, { teamProgress: "SELECTED" }],
        },
        orderBy: {
          ValidatorTotalScore: "desc",
        },
        include: {
          members: {
            include: { college: true },
          },
          ideaSubmission: true,
          referral: true,
          Scores: {
            where: {
              userId: ctx.session.user.id,
            },
            include: {
              score: true,
              Judges: true,
            },
          },
        },
      });
      return getTop100;
    } catch (error) {
		throw new TRPCError({
			code:"INTERNAL_SERVER_ERROR",
			message:"Oops! Something went wrong!"
		})
    }
  }),
});
