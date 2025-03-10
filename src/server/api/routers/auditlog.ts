import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc"; // Adjust the import path as needed

export const auditLog = createTRPCRouter({
  log: publicProcedure
    .input(
      z.object({
        sessionUser: z.string().min(1, "Session user is required"),
        audit: z.string().min(1, "Audit is required"), 
        description: z.string().min(1, "Description is required"), 
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newLog = await ctx.db.auditLog.create({
        data: {
          sessionUser: input.sessionUser,
          auditType: input.audit,
          description: input.description,
          dateTime: new Date(), 
        },
      });

      return newLog;
    }),

    getAuditLog: publicProcedure.query(async ({ ctx }) => {
      const audit = await ctx.db.auditLog.findMany();
      return audit ?? [];
    }),
  
});
