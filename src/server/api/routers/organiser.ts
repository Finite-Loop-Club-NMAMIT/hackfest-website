import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { addJudgeZ } from "~/server/schema/zod-schema";

export const organiserRouter = createTRPCRouter({
  getJudgesList: protectedProcedure.query(async ({ ctx }) => {
    if (
      ctx.session.user.role !== "ORGANISER" &&
      ctx.session.user.role !== "ADMIN"
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You cannot perform this action",
      });
    }

    return await ctx.db.judges.findMany({
      include: {
        User: true,
      },
    });
  }),
  addJudge: protectedProcedure
    .input(addJudgeZ)
    .mutation(async ({ input, ctx }) => {
      try {
        if (
          ctx.session.user.role !== "ORGANISER" &&
          ctx.session.user.role !== "ADMIN"
        ) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You cannot perform this action",
          });
        }

        const user = await ctx.db.user.findUnique({
          where: {
            id: input.userId,
          },
          include: {
            Judges: true,
          },
        });

        if (!user?.Judges) {
          await ctx.db.user.update({
            where: {
              id: input.userId,
            },
            data: {
              role: 'JUDGE',
            },
          });
          await ctx.db.judges.create({
            data: {
              userId: input.userId,
              track: input.track,
              type: input.type,
            },
          });
        } else {
          await ctx.db.user.update({
            where: {
              id: input.userId,
            },
            data: {
              role: 'JUDGE',
            },
          });
          await ctx.db.judges.update({
            where: {
              userId: input.userId,
            },
            data: {
              track: input.track,
              type: input.type,
            },
          });
        }
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
  removeJudge: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (
          ctx.session.user.role !== "ORGANISER" &&
          ctx.session.user.role !== "ADMIN"
        ) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You cannot perform this action",
          });
        }

        await ctx.db.judges.delete({
          where: {
            userId: input.userId,
          },
        });
        await ctx.db.user.update({
          where: {
            id: input.userId,
          },
          data: {
            role: "PARTICIPANT",
          },
        });
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
  getVolunteerList: protectedProcedure.query(async ({ ctx }) => {
    if (
      ctx.session.user.role !== "ORGANISER" &&
      ctx.session.user.role !== "ADMIN"
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You cannot perform this action",
      });
    }

    return await ctx.db.user.findMany({
      where: {
        role: "TEAM",
      },
    });
  }),
  addVolunteer: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (
          ctx.session.user.role !== "ORGANISER" &&
          ctx.session.user.role !== "ADMIN"
        ) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You cannot perform this action",
          });
        }
        await ctx.db.user.update({
          where: {
            id: input.id,
          },
          data: {
            role: "TEAM",
          },
        });
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
  removeVolunteer: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (
          ctx.session.user.role !== "ORGANISER" &&
          ctx.session.user.role !== "ADMIN"
        ) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You cannot perform this action",
          });
        }
        await ctx.db.user.update({
          where: {
            id: input.userId,
          },
          data: {
            role: "PARTICIPANT",
          },
        });
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
    // assignTeamNumbers: protectedProcedure.mutation(async ({ ctx }) => {
    //   try {
    //     if (
    //       ctx.session.user.role !== "ORGANISER" &&
    //       ctx.session.user.role !== "ADMIN"
    //     ) {
    //       throw new TRPCError({
    //         code: "UNAUTHORIZED",
    //         message: "You cannot perform this action",
    //       });
    //     }

    //     const teams = await ctx.db.team.findMany({
    //       where: {
    //         teamProgress: 'SELECTED'
    //       },
    //       orderBy: {
    //         name: 'asc'
    //       }
    //     })

    //     for (let i = 0; i < teams.length; i++) {
    //       await ctx.db.team.update({
    //         where: {
    //           id: teams[i]?.id
    //         },
    //         data: {
    //           teamNo: i + 1
    //         }
    //       })
    //     }
    //   } catch (error) {
    //     console.log(error);
    //     throw new TRPCError({
    //       code: "INTERNAL_SERVER_ERROR",
    //       message: "Something went wrong",
    //     });
    //   }
    // }),
});
