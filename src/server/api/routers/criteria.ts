import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import z from "zod";
import { CriteriaType } from "@prisma/client";

export const criteraRouter = createTRPCRouter({
  //TODO: get criteria based on type if they are different
  getCriteria: protectedProcedure.input(z.object({
    type: z.nativeEnum(CriteriaType).optional()
  })).query(async ({ ctx, input }) => {
    return await ctx.db.criteria.findMany({
      where: {
        type: input.type ?? "JUDGE"
      },
      select: {
        id: true,
        name: true,
      },
    });
  }),
});
