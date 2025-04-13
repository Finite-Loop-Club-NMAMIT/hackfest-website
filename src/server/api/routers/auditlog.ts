import { z } from "zod";
// Assuming adminProcedure exists for role-based access control
import { createTRPCRouter, publicProcedure, adminProcedure } from "../trpc";

export const auditLog = createTRPCRouter({
  log: publicProcedure // Keep this public if logging can happen from various places
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

    // Changed to adminProcedure and added ordering
    getAuditLog: adminProcedure.query(async ({ ctx }) => {
      const audit = await ctx.db.auditLog.findMany({
        orderBy: {
          dateTime: 'desc', // Order by date descending
        }
      });
      return audit ?? [];
    }),

    // New procedure to get filtered logs
    getFilteredAuditLog: adminProcedure
      .input(
        z.object({
          auditType: z.string().optional(), // Make filter optional
        })
      )
      .query(async ({ ctx, input }) => {
        const whereClause = input.auditType
          ? { auditType: input.auditType }
          : {}; // Empty where clause if no filter

        const audit = await ctx.db.auditLog.findMany({
          where: whereClause,
          orderBy: {
            dateTime: 'desc', // Order by date descending
          },
        });
        return audit ?? [];
      }),

    // New procedure to get distinct audit types for filter dropdown
    getDistinctAuditTypes: adminProcedure
      .query(async ({ ctx }) => {
        const distinctTypes = await ctx.db.auditLog.findMany({
          select: {
            auditType: true,
          },
          distinct: ['auditType'],
          orderBy: {
            auditType: 'asc', // Optional: order types alphabetically
          }
        });
        // Filter out potential null/empty strings if necessary, though schema implies non-null
        return distinctTypes.map(item => item.auditType).filter(Boolean);
      }),

});
