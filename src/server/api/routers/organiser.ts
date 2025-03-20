import { TeamProgress } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { addJudgeZ } from "~/server/schema/zod-schema";
import { Role } from "@prisma/client";

export const organiserRouter = createTRPCRouter({
  getJudgesList: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.judge.findMany({
      include: {
        User: true,
      },
    });
  }),
  addJudge: adminProcedure.input(addJudgeZ).mutation(async ({ input, ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        id: input.userId,
      },
      select: {
        id: true,
        role: true,
        Judge: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    if (input.type === "VALIDATOR")
    {
      await ctx.db.user.update({
        where: {
          id: input.userId,
        },
        data: {
          role: Role.VALIDATOR,          
          Judge: {
            create: {
              type: input.type, 
              id: input.userId,
            }
          },
        },
      });
      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "Role Change",
          description: `User ${input.userId} has been assigned as a Validator`,
        },
      });
    }
    if (input.type === "SUPER_VALIDATOR")
      {
        await ctx.db.user.update({
          where: {
            id: input.userId,
          },
          data: {
            role: Role.SUPER_VALIDATOR,
          },
        });
        await ctx.db.judge.create({
          data: {
            type: input.type,
            id: input.userId,
            User: {
              connect: {  
                id: input.userId,
              },
            },
          },
        });
        await ctx.db.auditLog.create({
          data: {
            sessionUser: ctx.session.user.email,
            auditType: "Role Change",
            description: `User ${input.userId} has been assigned as a Super Validator`,
          },
        });
      }

    if ((input.type==="DAY1"||input.type==="DAY2"||input.type ==="DAY3" )) {
      await ctx.db.user.update({
        where: {
          id: input.userId,
        },
        data: {
          role: Role.JUDGE,
        },
      });

      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "Role Change",
          description: `User ${input.userId} has been assigned as a Judge for ${input.type}`,
        },
      });
    } 
  }),
  removeJudge: adminProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // First check if the judge exists
        const judge = await ctx.db.judge.findUnique({
          where: {
            id: input.userId,
          },
        });
        
        if (!judge) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Judge not found",
          });
        }
        
        // Proceed with deletion in transaction to ensure both operations succeed or fail together
        return await ctx.db.$transaction(async (tx) => {
          await tx.judge.delete({
            where: {
              id: input.userId,
            },
          });
          await ctx.db.auditLog.create({
            data: {
              sessionUser: ctx.session.user.email,
              auditType: "Role Change",
              description: `User ${input.userId} has been removed as a Judge`,
            },
          });
          
          return await tx.user.update({
            where: {
              id: input.userId,
            },
            data: {
              role: "PARTICIPANT",
            },
          });
          
        });
      } catch (error) {
        console.error("Error removing judge:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to delete judge",
          cause: error,
        });
      }
    }),
  getVolunteerList: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findMany({
      where: {
        role: "TEAM",
      },
    });
  }),
  addVolunteer: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.user.update({
        where: {
          id: input.id,
        },
        data: {
          role: "TEAM",
        },
      });
      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "Role Change",
          description: `User ${input.id} has been assigned as a Volunteer`,
        },
      });
    }),
  removeVolunteer: adminProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.user.update({
        where: {
          id: input.userId,
        },
        data: {
          role: "PARTICIPANT",
        },
      });
      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "Role Change",
          description: `User ${input.userId} has been removed as a Volunteer`,
        },
      });
    }),
  changeTeamProgress: adminProcedure
    .input(
      z.object({
        teamId: z.string(),
        progress: z.nativeEnum(TeamProgress),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      if (user.role !== "JUDGE")
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to perform this action",
        });
      const team = await ctx.db.team.findUnique({
        where: {
          id: input.teamId,
        },
      });
      if (!team)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        });
      const updatedTeam = await ctx.db.team.update({
        where: {
          id: input.teamId,
        },
        data: {
          teamProgress: input.progress,
        },
      });
      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "TEAM_PROGRESS",
          description: `Team ${input.teamId} progress has been updated to ${input.progress}`,
        },
      });
      return updatedTeam;
    }),
});
