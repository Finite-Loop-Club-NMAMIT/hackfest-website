import { TRPCError } from "@trpc/server";
import { createTRPCRouter, judgeProcedure } from "../trpc";
import { z } from "zod";
import { JudgeType, Role } from "@prisma/client";

export const JudgeRouter = createTRPCRouter({
  getTeams: judgeProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    const teams = await ctx.db.team.findMany({
      where: {
        teamProgress: "SELECTED",
      },
      include: {
        IdeaSubmission: true,
        Scores: {
          where: {
            Judge: {
              id: user.id,
            },
          },
        },
        Remark: true,
      },
    });
    return teams;
  }),
  getCriterias: judgeProcedure
    .input(
      z.object({
        judgeType: z.nativeEnum(JudgeType),
      }),
    )
    .query(async ({ input, ctx }) => {
      const criterias = await ctx.db.criteria.findMany({
        where: {
          JudgeType: input.judgeType,
        },
      });
      return criterias;
    }),
  getTop15Teams: judgeProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    const teams = await ctx.db.team.findMany({
      where: {
        teamProgress: {
          in: ["TOP15", "WINNER", "RUNNER", "SECOND_RUNNER", "TRACK"],
        },
      },
      include: {
        IdeaSubmission: true,
        Scores: {
          where: {
            Judge: {
              id: user.id,
            },
          },
        },
      },
      orderBy: {
        IdeaSubmission: {
          track: "asc",
        },
      },
    });
    return teams;
  }),
  getDay: judgeProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    const judges = await ctx.db.judge.findFirst({
      where: {
        User: {
          some: {
            id: user.id,
          },
        },
      },
      select: {
        type: true,
      },
    });
    return judges;
  }),

  setScore: judgeProcedure
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
        if (!judge || !criteria)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Judge or criteria not found",
          });
        if (judge.type !== criteria.JudgeType)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Judge is not allowed to score this criteria",
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
            return await db.scores.create({
              data: {
                score: input.score,
                criteriaId: input.criteriaId,
                teamId: input.teamId,
                judgeId: judge.id,
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
        return await db.scores.update({
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
      });
    }),

  getAllJudges: judgeProcedure.query(async ({ ctx }) => {
    const judges = await ctx.db.judge.findMany({
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          }
        }
      }
    });
    return judges;
  }),
  
  updateJudge: judgeProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.nativeEnum(JudgeType),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.judge.update({
        where: {
          id: input.id,
        },
        data: {
          type: input.type,
        },
      });
    }),

  getAllUsers: judgeProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({
      where: {
        role: {
          not: Role.JUDGE,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
      },
    });
    return users;
  }),
  
  addJudge: judgeProcedure
    .input(
      z.object({
        userId: z.string(),
        type: z.nativeEnum(JudgeType),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.$transaction(async (tx) => {
        // Create new judge
        const newJudge = await tx.judge.create({
          data: {
            type: input.type,
            User: {
              connect: {
                id: input.userId,
              },
            },
          },
        });
        
        // Update user role
        await tx.user.update({
          where: {
            id: input.userId,
          },
          data: {
            role: Role.JUDGE,
          },
        });
        
        return newJudge;
      });
    }),
  
  deleteJudge: judgeProcedure
    .input(
      z.object({
        judgeId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.$transaction(async (tx) => {
        // Update user role back to participant
        await tx.user.update({
          where: {
            id: input.userId,
          },
          data: {
            role: Role.PARTICIPANT,
            judgeId: null,
          },
        });
        
        // Delete the judge entry
        await tx.judge.delete({
          where: {
            id: input.judgeId,
          },
        });
        
        return { success: true };
      });
    }),
});
