import { z } from "zod";
import { createTRPCRouter, superValidatorProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const superValidatorRouter = createTRPCRouter({
  getTop100: superValidatorProcedure.query(async ({ ctx }) => {
    const teams = await ctx.db.team.findMany({
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
        Scores: {
          select: {
            score: true,
          },
        },
      },
    });
    
    // Calculate total score for each team and sort
    return teams.map(team => {
      const totalScore = team.Scores.reduce((sum, scoreRecord) => sum + scoreRecord.score, 0);
      return {
        ...team,
        totalScore // Add total score property for sorting (won't be displayed in UI)
      };
    }).sort((a, b) => b.totalScore - a.totalScore); // Sort in descending order
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
            await db.auditLog.create({
              data: {
                sessionUser: ctx.session.user.email,
                auditType: "SCORE_SET",
                description: `SuperValidator ${user.email} set score ${input.score} for team ${input.teamId} on criteria ${input.criteriaId}`,
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
        } else {
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
          await db.auditLog.create({
            data: {
              sessionUser: ctx.session.user.email,
              auditType: "SCORE_SET",
              description: `SuperValidator ${user.email} updated score to ${input.score} for team ${input.teamId} on criteria ${input.criteriaId}`,
            },
          });
        }

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
      const settings = await ctx.db.appSettings.findFirst();
      if (settings?.isResultOpen) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot modify team status while results are published",
      });
      }

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
        const updatedTeam = await ctx.db.team.update({
          where: { id: input.teamId },
          data: { teamProgress: "SELECTED" },
        });
        await ctx.db.auditLog.create({
          data: {
            sessionUser: ctx.session.user.email,
            auditType: "TEAM_STATUS_UPDATE",
            description: `SuperValidator ${ctx.session.user.email} moved team ${input.teamId} to Top 60 (SELECTED)`,
          },
        });
        return updatedTeam;
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
        const updatedTeam = await ctx.db.team.update({
          where: { id: input.teamId },
          data: { teamProgress: "SEMI_SELECTED" },
        });
        await ctx.db.auditLog.create({
          data: {
            sessionUser: ctx.session.user.email,
            auditType: "TEAM_STATUS_UPDATE",
            description: `SuperValidator ${ctx.session.user.email} reset team ${input.teamId} to Top 100 (SEMI_SELECTED)`,
          },
        });
        return updatedTeam;
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Team must be in Top 60 to move back to Top 100",
        });
      }
    }),
});
