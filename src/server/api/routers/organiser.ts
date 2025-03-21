import { TeamProgress } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, createTRPCRouter, dashboardProcedure } from "~/server/api/trpc";
import { addJudge } from "~/server/schema/zod-schema";
import { Role } from "@prisma/client";

export const organiserRouter = createTRPCRouter({
  getJudgesList: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.judge.findMany({
      select: {
        id: true,
        type: true,
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }),
  addJudge: adminProcedure.input(addJudge).mutation(async ({ input, ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: {
         id: input.userId 
        },
      select: { 
        id: true, 
        role: true, 
        Judge: true 
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Create judge record and update user role in a transaction
    await ctx.db.$transaction(async (tx) => {
      // Create judge record
      await tx.judge.create({
        data: {
          id: input.userId,
          type: input.type,
          User: {
            connect: { id: input.userId }
          }
        }
      });

      // Update user role based on judge type
      const role = input.type === "VALIDATOR" 
        ? Role.VALIDATOR 
        : input.type === "SUPER_VALIDATOR"
          ? Role.SUPER_VALIDATOR
          : Role.JUDGE;

      await tx.user.update({
        where: { 
          id: input.userId 
        },
        data: { 
          role
         }
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "Role Change",
          description: `User ${input.userId} has been assigned as a ${input.type}`
        }
      });
    });
  }),
  removeJudge: dashboardProcedure
    .input(
      z.object({
        userId: z.string(),
        judgeId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Find the judge record first with User relation
        const judge = await ctx.db.judge.findFirst({
          where: {
            id: input.judgeId,
          },
          include: {
            User: true
          }
        });
        
        if (!judge) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Judge not found",
          });
        }
        
        // Proceed with deletion in transaction
         await ctx.db.$transaction(async (tx) => {
            // Then update the user role if needed
            const user = await ctx.db.user.findUnique({
              where: { id: input.userId },
              select: { role: true }
              });
              if (!user) {
                throw new Error("User not found");
              }
  
              if (user?.role !== Role.PARTICIPANT) {
              await ctx.db.user.update({
                where: {
                id: input.userId,
                },
                data: {
                role: Role.PARTICIPANT,
                },
              });
              }


          // Delete the judge record first
          await tx.judge.delete({
            where: {
              id: input.judgeId,
            },
          });



          // Create audit log
          return await ctx.db.auditLog.create({
            data: {
              sessionUser: ctx.session.user.email,
              auditType: "Role Change",
              description: `User ${input.userId} has been removed as a Judge`,
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
