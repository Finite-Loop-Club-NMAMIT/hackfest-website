import { type States } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { createCollegeZ } from "~/server/schema/zod-schema";

export const collegeRouter = createTRPCRouter({
  createCollege: adminProcedure
    .input(createCollegeZ)
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.college.create({
          data: {
            name: input.name,
            state: input.state.toUpperCase() as States,
          },
        });
        return { status: "success", message: "College created successfully" };
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),

  getColleges: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.college.findMany({
      select: {
        id: true,
        name: true,
        state: true,
      },
    });
  }),
});
