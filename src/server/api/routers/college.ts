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
        const newCollege = await ctx.db.college.create({
          data: {
            name: input.name,
            state: input.state.toUpperCase() as States,
          },
        });
        await ctx.db.auditLog.create({
          data: {
            sessionUser: ctx.session.user.email,
            auditType: "COLLEGE_CREATE",
            description: `Admin ${ctx.session.user.email} created college '${input.name}' (State: ${input.state}, ID: ${newCollege.id})`,
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
