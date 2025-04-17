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
            auditType: "REMARK",
            description: `Remark for team ${input.teamId} has been updated `,
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
          auditType: "REMARK",
          description: ` Remark for team ${input.teamId} has been added `,
        },
      });
    }),

  getRemarks: remarkProcedure.query(async ({ ctx }) => {
    return ctx.db.remark.findMany();
  }),
});
