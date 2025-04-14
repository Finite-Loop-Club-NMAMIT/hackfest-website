import { z } from "zod";
import { createTRPCRouter, remarkProcedure } from "../trpc";

export const remarkRouter = createTRPCRouter({
  addRemark: remarkProcedure
    .input(
      z.object({
        remark: z.string(),
        judgeId: z.string(),
        teamId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const remark = await ctx.db.remark.findUnique({
        where: {
          teamId_judgeId: {
            teamId: input.teamId,
            judgeId: input.judgeId,
          },
        },
      });

      if (remark) {
        await ctx.db.remark.update({
          where: {
            teamId_judgeId: {
              teamId: input.teamId,
              judgeId: input.judgeId,
            },
          },
          data: {
            remark: input.remark,
          },
        });
        return await ctx.db.auditLog.create({
          data: {
            sessionUser: ctx.session.user.email,
            auditType: "REMARK_UPDATE",
            description: `User ${ctx.session.user.email} (Judge ID: ${input.judgeId}) updated remark for team ${input.teamId}. Remark: "${input.remark}"`,
          },
        });
      }

      await ctx.db.remark.create({
        data: {
          remark: input.remark,
          judgeId: input.judgeId,
          teamId: input.teamId,
        },
      });
      return await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "REMARK_ADD",
          description: `User ${ctx.session.user.email} (Judge ID: ${input.judgeId}) added remark for team ${input.teamId}. Remark: "${input.remark}"`,
        },
      });
    }),

  getRemarks: remarkProcedure.query(async ({ ctx }) => {
    return ctx.db.remark.findMany();
  }),
  
  // New endpoint to get teams with remarks
  getTeamsWithRemarks: remarkProcedure.query(async ({ ctx }) => {
    // First, get all teams with remarks
    const teams = await ctx.db.team.findMany({
      where: {
        OR: [
              { teamProgress: "SELECTED" },
              { teamProgress: "TOP15" }
            ],
        teamProgress: "SELECTED",
        Remark: {
          some: {} // Teams that have at least one remark
        }
      },
      select: {
        id: true,
        teamNo: true,
        name: true,
        IdeaSubmission:{
          select: {
            track: true,
          }
        },
        Remark: {
          select: {
            id: true,
            remark: true,
            createdAt: true,
            Judge: {
              select: {
                type: true,
                User: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        teamNo: 'asc'
      }
    });

    const REMARK_DELIMITER = ';;;';

    // Transform the data to match our frontend expectations
    return teams.map(team => {
      return {
        id: team.id,
        teamNo: team.teamNo,
        name: team.name,
        track: team.IdeaSubmission?.track,
        remarks: team.Remark.map(remark => {
          const judgeName = remark.Judge?.User?.[0]?.name ?? null;
          const judgeType = remark.Judge?.type || null;
          
          // Split remark string by delimiter
          const remarkPoints = remark.remark ? 
            remark.remark.split(REMARK_DELIMITER).filter(point => point.trim() !== '') : 
            [];

          return {
            id: remark.id,
            judgeName,
            judgeType,
            remarkPoints,
            date: remark.createdAt
          };
        })
      };
    });
  })
});
