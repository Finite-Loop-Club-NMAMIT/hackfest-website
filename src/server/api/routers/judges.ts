import { TRPCError } from "@trpc/server";
import { createTRPCRouter, judgeProcedure } from "../trpc";
import { z } from "zod";
import { JudgeType, Role, TeamProgress } from "@prisma/client"; // Added TeamProgress

export const JudgeRouter = createTRPCRouter({
  // Fetches teams for Day 1 (Remarks) and Day 2 (Scoring)
  getTeams: judgeProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    const teams = await ctx.db.team.findMany({
      where: {
        teamProgress: "SELECTED", 
        attended: true// Day 1 & 2 judges see teams selected for the main event
      },
      include: {
        IdeaSubmission: true,
        Scores: { // Needed for Day 2 display (scores by the current judge)
          where: {
            // Assuming user.id is the Judge ID from the context procedure
            judgeId: user.id,
          },
        },
        Remark: { // Fetch all remarks for the team
          include: {
            Judge: { // Include the judge who made the remark
              select: {
                type: true, // Select the judge's type
                User: { // Include the related User(s)
                  select: {
                    id: true, // Explicitly select the user's ID
                    name: true, // Select the user's name
                  }
                }
              }
            }
          }
        },
        Members: { // Include Members
          select: {
            name: true,
            image: true,
          },
          orderBy: { // Optional: Order members if needed
            isLeader: 'desc', // Show leader first
          }
        }
      },
      orderBy: {
        teamNo: "asc",
      }
    });
    // No longer need separate remark fetching here, included above
    return teams;
  }),

  getCriterias: judgeProcedure
    .input(
      z.object({
        // Use specific round types
        judgeType: z.enum([JudgeType.DAY2_ROUND1, JudgeType.DAY2_ROUND2, JudgeType.VALIDATOR, JudgeType.SUPER_VALIDATOR]),
      }),
    )
    .query(async ({ input, ctx }) => {
      const criterias = await ctx.db.criteria.findMany({
        where: {
          JudgeType: input.judgeType,
        },
      });
      // Ensure maxScore is set correctly in the database for Day 2 criteria (should be 10)
      return criterias;
    }),

  // Renamed from getTop15Teams, fetches teams for Day 3 Finals judging
  getDay3Teams: judgeProcedure.query(async ({ ctx }) => {
    const teams = await ctx.db.team.findMany({
      where: {
        attended: true, // Only include teams that attended
        // Day 3 judges see teams that are either SELECTED (Top 60) or already promoted to TOP15
        teamProgress: {
          in: [TeamProgress.SELECTED, TeamProgress.TOP15],
        },
      },
      include: {
        IdeaSubmission: true,
        Remark:{
          include: {
            Judge: {
              select: {
                type: true,
                User: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              }
            }
          }
        },
        Members: { // Include Members
          select: {
            name: true,
            image: true,
          },
           orderBy: { // Optional: Order members if needed
            isLeader: 'desc', // Show leader first
          }
        }
        // Scores might not be needed for Day 3 promotion/demotion view
      },
      orderBy: [
        {teamNo: "asc"},
      ]
    });
    return teams;
  }),

  // Returns the specific type and tutorial status of the judge
  getDay: judgeProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    // Assuming user.id is the Judge's ID based on the session context logic
    const judge = await ctx.db.judge.findUnique({
      where: {
        id: user.id, // Make sure user.id corresponds to Judge ID in your setup
      },
      select: {
        type: true,
        tutorialShown: true, // Select the tutorial status
      },
    });
     if (!judge) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Judge not found" });
    }
    return judge; // Return the judge object containing the type and tutorial status
  }),

  setScore: judgeProcedure
    .input(
      z.object({
        score: z.number().min(1).max(10), // Enforce 1-10 range
        teamId: z.string(),
        criteriaId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.$transaction(async (db) => {
        const user = ctx.session.user;
        // Fetch judge with type
        const judge = await db.judge.findUnique({
          where: {
            id: user.id,
          },
          select: { id: true, type: true }, // Select type
        });
        const criteria = await db.criteria.findUnique({
          where: {
            id: input.criteriaId,
          },
          select: { id: true, JudgeType: true, maxScore: true }, // Select JudgeType and maxScore
        });

        if (!judge || !criteria)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Judge or criteria not found",
          });

        // Check if judge type matches criteria type
        if (judge.type !== criteria.JudgeType)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Judge type (${judge.type}) does not match criteria type (${criteria.JudgeType})`,
          });

        // Optional: Double-check against criteria.maxScore from DB, though Zod validation should suffice if DB is correct
        if (input.score > criteria.maxScore) {
           throw new TRPCError({
             code: "BAD_REQUEST",
             message: `Score (${input.score}) exceeds maximum limit (${criteria.maxScore}) for this criteria`,
           });
        }

        const oldScoreForCriteria = await db.scores.findFirst({
          where: {
            judgeId: user.id, // Use judgeId directly
            criteriaId: input.criteriaId,
            teamId: input.teamId,
          },
        });

        if (!oldScoreForCriteria) {
          // Score creation logic remains similar
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
              description: `Judge ${user.email} (Type: ${judge.type}) set score ${input.score} for team ${input.teamId} on criteria ${input.criteriaId}`,
            },
          });
        } else {
          // Score update logic remains similar
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
              auditType: "SCORE_UPDATE", // Changed auditType for clarity
              description: `Judge ${user.email} (Type: ${judge.type}) updated score to ${input.score} for team ${input.teamId} on criteria ${input.criteriaId}`,
            },
          });
        }
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
        type: z.nativeEnum(JudgeType), // Use updated enum
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.judge.update({
        where: {
          id: input.id,
        },
        data: {
          type: input.type,
        },
      });
      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "JUDGE_UPDATE",
          description: `Admin ${ctx.session.user.email} updated judge ${input.id} type to ${input.type}`,
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
        type: z.nativeEnum(JudgeType), // Use updated enum
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.$transaction(async (tx) => {
        // Create new judge
        const newJudge = await tx.judge.create({
          data: {
            type: input.type, // Use input type
            User: {
              connect: {
                id: input.userId,
              },
            },
          },
        });
        
        
        // Update user role and connect to judge
        await tx.user.update({
          where: {
            id: input.userId,
          },
          data: {
            role: Role.JUDGE,
            judgeId: newJudge.id, // Connect user to judge
          },
        });

        await ctx.db.auditLog.create({
          data: {
            sessionUser: ctx.session.user.email,
            auditType: "JUDGE_ADD",
            description: `Admin ${ctx.session.user.email} assigned user ${input.userId} as a Judge (Type: ${input.type})`,
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
        await ctx.db.auditLog.create({
          data: {
            sessionUser: ctx.session.user.email,
            auditType: "JUDGE_DELETE",
            description: `Admin ${ctx.session.user.email} removed Judge role (ID: ${input.judgeId}) from user ${input.userId}`,
          },
        });
        return { success: true };
      });
    }),

  // Marks the tutorial as shown for the current judge
  markTutorialAsShown: judgeProcedure
    .mutation(async ({ ctx }) => {
      const user = ctx.session.user;
      const updatedJudge = await ctx.db.judge.update({
        where: {
          id: user.id,
        },
        data: {
          tutorialShown: true,
        },
      });

      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "TUTORIAL_COMPLETED",
          description: `Judge ${user.email} (ID: ${user.id}) completed the tutorial.`,
        },
      });

      return updatedJudge;
    }),
});
