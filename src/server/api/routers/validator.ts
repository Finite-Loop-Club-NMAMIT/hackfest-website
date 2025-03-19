import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, validatorProcedure } from "~/server/api/trpc";

export const validatorRouter = createTRPCRouter({
  getValidatorCriteria: validatorProcedure.query(async ({ ctx }) => {
    return await ctx.db.criteria.findFirst({
      where: {
        JudgeType: "VALIDATOR",
      },
    });
  }),
  
  // New query to fetch all scores for the validator judge
  getAllScores: validatorProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    
    // Get all scores for this validator
    const scores = await ctx.db.scores.findMany({
      where: {
        Judge: {
          id: user.id,
        },
      },
      include: {
        Team: true,
        Criteria: true,
      }
    });
    
    return scores;
  }),
  
  setScore: protectedProcedure
    .input(
      z.object({
        score: z.number().min(1).max(10),
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
        if (!judge || !criteria || criteria.JudgeType !== "VALIDATOR")
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "Judge or criteria not found or criteria is not for validator",
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
                // validatorScore: {
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

        // const diffScore = input.score - oldScoreForCriteria.score;
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
            // validatorScore: {
            //   increment: diffScore,
            // },
          },
        });
      });
    }),
});
