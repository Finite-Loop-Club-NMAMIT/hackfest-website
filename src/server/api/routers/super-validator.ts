import { z } from "zod";
import { createTRPCRouter, superValidatorProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const superValidatorRouter = createTRPCRouter({
  getTop100: superValidatorProcedure.query(async ({ ctx }) => {
    return await ctx.db.team.findMany({
      where: {
        OR: [{ teamProgress: "SEMI_SELECTED" }, { teamProgress: "SELECTED" }],
      },
      include: {
        Members: {
          include: {
            College:{
              select:{
                name:true
              }
            },
          },
        },
        IdeaSubmission: {
          select: {
            pptUrl: true,
            track: true,
          },
        },
        Scores: true,
      },
    });
  }),

  setScore: superValidatorProcedure
    .input(
      z.object({
        score: z.number().min(1).max(10), //todo: set limits
        teamId: z.string(),
        criteriaId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.$transaction(async (db) => {
        const user = ctx.session.user;
        const judge = await db.judge.findFirst({
          where: {
            id: user.id,
          },
        });
        const criteria = await db.criteria.findUnique({
          where: {
            id: input.criteriaId,
          },
        });
        if (!judge || !criteria || criteria.JudgeType !== "SUPER_VALIDATOR")
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "Judge or criteria not found or criteria is not for super validator",
          });

        const oldScoreForCriteria = await db.scores.findFirst({
          where: {
            Judge: {
              id: user.id,
            },
            criteriaId: input.criteriaId,
            teamId: input.teamId,
          },
        });

        if (!oldScoreForCriteria) {
          if (input.score <= criteria.maxScore) {
            await db.scores.create({
              data: {
                score: input.score,
                criteriaId: input.criteriaId,
                teamId: input.teamId,
                judgeId: judge.id,
              },
            });
            return await db.team.update({
              where: {
                id: input.teamId,
              },
              data: {
                // superValidatorScore: {
                //   increment: input.score,
                // },
              },
            });
          } else {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Score exceeds maximum limit",
            });
          }
        }
        await db.scores.update({
          where: {
            teamId_criteriaId_judgeId: {
              criteriaId: input.criteriaId,
              teamId: input.teamId,
              judgeId: judge.id,
            },
          },
          data: {
            score: input.score,
          },
        });

        return await db.team.update({
          where: {
            id: input.teamId,
          },
          data: {
            // superValidatorScore: {
            //   increment: diffScore,
            // },
          },
        });
      });
    }),

  moveToSelected: superValidatorProcedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const team = await ctx.db.team.findUnique({
        where: { id: input.teamId },
      });

      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        });
      }

      if (team.teamProgress === "SEMI_SELECTED") {
        return await ctx.db.team.update({
          where: { id: input.teamId },
          data: { teamProgress: "SELECTED" },
        });
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Team must be in Top 100 to move to Top 60",
        });
      }
    }),

  resetToTop100: superValidatorProcedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const team = await ctx.db.team.findUnique({
        where: { id: input.teamId },
      });

      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        });
      }

      if (team.teamProgress === "SELECTED") {
        return await ctx.db.team.update({
          where: { id: input.teamId },
          data: { teamProgress: "SEMI_SELECTED" },
        });
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Team must be in Top 60 to move back to Top 100",
        });
      }
    }),
});
