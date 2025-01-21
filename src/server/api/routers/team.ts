import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import {
  createTeamZ,
  getTeamDetailsByIdZ,
  joinTeamZ,
} from "~/server/schema/zod-schema";

export const teamRouter = createTRPCRouter({
  checkName: protectedProcedure
    .input(createTeamZ)
    .query(async ({ input, ctx }) => {
      try {
        const team = await ctx.db.team.findFirst({
          where: {
            name: input.teamName,
          },
        });
        if (team?.id) {
          return { status: "success", message: false };
        }
        return { status: "success", message: true };
      } catch (error) {
        console.log(error);
        return { status: "error", message: "Something went wrong" };
      }
    }),

  createTeam: protectedProcedure
    .input(createTeamZ)
    .mutation(async ({ input, ctx }) => {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Registrations closed",
      });
      // const user = ctx.session.user;
      // if (user.team) {
      //   throw new TRPCError({
      //     code: "BAD_REQUEST",
      //     message: "You are already in a team",
      //   });
      // }

      // if (
      //   user.profileProgress !== "FORM_TEAM" &&
      //   user.profileProgress !== "SUBMIT_IDEA"
      // ) {
      //   throw new TRPCError({
      //     code: "BAD_REQUEST",
      //     message: "Please complete your profile first",
      //   });
      // }

      // const teamNameExists = await ctx.db.team.findFirst({
      //   where: {
      //     name: input.teamName,
      //   },
      // });

      // if (teamNameExists) {
      //   throw new TRPCError({
      //     code: "BAD_REQUEST",
      //     message: "Team name already exists",
      //   });
      // }

      // try {
      //   await ctx.db.user.update({
      //     where: {
      //       id: user.id,
      //     },
      //     data: {
      //       isLeader: true,
      //       team: {
      //         create: {
      //           name: input.teamName,
      //         },
      //       },
      //     },
      //   });
      //   return {
      //     status: "success",
      //     message: "Team created successfully",
      //   };
      // } catch (error) {
      //   console.log(error);
      //   throw new TRPCError({
      //     code: "INTERNAL_SERVER_ERROR",
      //     message: "Something went wrong",
      //   });
      // }
    }),

  joinTeam: protectedProcedure
    .input(joinTeamZ)
    .mutation(async ({ input, ctx }) => {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Registrations closed",
      });
      // const user = ctx.session.user;
      // if (user?.team) {
      //   throw new TRPCError({
      //     code: "BAD_REQUEST",
      //     message: "You are already in a team",
      //   });
      // }

      // if (
      //   user?.profileProgress !== "FORM_TEAM" &&
      //   user?.profileProgress !== "SUBMIT_IDEA"
      // ) {
      //   throw new TRPCError({
      //     code: "BAD_REQUEST",
      //     message: "Please complete your profile first",
      //   });
      // }

      // const team = await ctx.db.team.findFirst({
      //   where: {
      //     id: input.teamId,
      //   },
      //   include: {
      //     members: {
      //       include: { college: true },
      //     },
      //     ideaSubmission: true,
      //   },
      // });
      // if (!team) {
      //   throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
      // }

      // if (team.ideaSubmission) {
      //   throw new TRPCError({
      //     code: "BAD_REQUEST",
      //     message: "Idea already submitted",
      //   });
      // }

      // if (team.members.length >= 4) {
      //   throw new TRPCError({ code: "BAD_REQUEST", message: "Team is full" });
      // }

      // const leader = team.members.find((member) => member.isLeader === true);
      // if (user.college !== leader?.college?.name) {
      //   throw new TRPCError({
      //     code: "BAD_REQUEST",
      //     message: "Team members should be from same college only",
      //   });
      // }
      // try {
      //   const res = await ctx.db.team.update({
      //     where: {
      //       id: input.teamId,
      //     },
      //     data: {
      //       members: {
      //         connect: {
      //           id: user?.id,
      //         },
      //       },
      //     },
      //     include: {
      //       members: true,
      //     },
      //   });

      //   const isComplete = res.members.length === 3 || res.members.length === 4;
      //   await ctx.db.team.update({
      //     where: {
      //       id: input.teamId,
      //     },
      //     data: {
      //       isComplete,
      //     },
      //   });
      //   return { status: "success", message: "Joined team successfully" };
      // } catch (error) {
      //   console.log(error);
      //   throw new TRPCError({
      //     code: "INTERNAL_SERVER_ERROR",
      //     message: "Something went wrong",
      //   });
      // }
    }),

  leaveTeam: protectedProcedure.mutation(async ({ ctx }) => {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You cannot leave/join team anymore",
    });
    // try {
    //   const user = ctx.session.user;
    //   await ctx.db.user.update({
    //     where: {
    //       id: user?.id,
    //     },
    //     data: {
    //       team: {
    //         disconnect: true,
    //       },
    //       profileProgress: "FORM_TEAM",
    //     },
    //   });

    //   const team = await ctx.db.team.findFirst({
    //     where: {
    //       id: user?.team?.id,
    //     },
    //     include: {
    //       members: true,
    //     },
    //   });

    //   const isComplete =
    //     team?.members.length === 3 || team?.members.length === 4;

    //   if (!isComplete) {
    //     await ctx.db.user.updateMany({
    //       where: {
    //         teamId: team?.id,
    //       },
    //       data: {
    //         profileProgress: "FORM_TEAM",
    //       },
    //     });
    //   }

    //   await ctx.db.team.update({
    //     where: {
    //       id: user?.team?.id,
    //     },
    //     data: {
    //       isComplete,
    //     },
    //   });

    //   return { status: "success", message: "Left team successfully" };
    // } catch (error) {
    //   console.log(error);
    //   throw new TRPCError({
    //     code: "INTERNAL_SERVER_ERROR",
    //     message: "Something went wrong",
    //   });
    // }
  }),

  deleteTeam: protectedProcedure.mutation(async ({ ctx }) => {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You cannot delete this team anymore",
    });
    // try {
    //   const user = ctx.session.user;

    //   if (!user?.isLeader) {
    //     throw new TRPCError({
    //       code: "BAD_REQUEST",
    //       message: "You are not the leader of this team",
    //     });
    //   }

    //   await ctx.db.team.update({
    //     data: {
    //       members: {
    //         updateMany: {
    //           where: {
    //             teamId: user.team?.id,
    //           },
    //           data: {
    //             profileProgress: "FORM_TEAM",
    //             isLeader: false,
    //           },
    //         },
    //       },
    //     },
    //     where: {
    //       id: user.team?.id,
    //     },
    //   });

    //   await ctx.db.team.delete({
    //     where: {
    //       id: user.team?.id,
    //     },
    //   });

    //   return { status: "success", message: "Team deleted successfully" };
    // } catch (error) {
    //   console.log(error);
    //   throw new TRPCError({
    //     code: "INTERNAL_SERVER_ERROR",
    //     message: "Something went wrong",
    //   });
    // }
  }),

  getTeamDetailsById: protectedProcedure
    .input(getTeamDetailsByIdZ)
    .query(async ({ input, ctx }) => {
      try {
        if (!input.teamId) return null;
        const team = await ctx.db.team.findUnique({
          where: {
            id: input.teamId,
          },
          include: {
            members: {
              include: {
                college: true,
              },
            },
            ideaSubmission: true,
          },
        });
        return team;
      } catch (error) {
        console.log(error);
        return null;
      }
    }),

  getTeamsList: protectedProcedure.query(async ({ ctx }) => {
    console.log(ctx.session.user.role);
    if (ctx.session.user.role === "PARTICIPANT")
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not an organiser",
      });
    try {
      return await ctx.db.team.findMany({
        include: {
          members: {
            include: { college: true },
          },
          ideaSubmission: true,
          referral: true,
          Scores: {
            where: {
              userId: ctx.session.user.id,
            },
            include: {
              score: true,
              Judges: true,
            },
			orderBy:{
				score:{
					score:"desc"
				}
			}
          },
			videoSubmission:true
        },
        orderBy: {
          name: 'asc'
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }),
  top15: protectedProcedure.query(async ({ ctx }) => {
    console.log(ctx.session.user.role);
    if (ctx.session.user.role === "PARTICIPANT")
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not an organiser",
      });
    try {
      return await ctx.db.team.findMany({
		  where:{
			  teamProgress:"TOP15"
		  },
        include: {
          members: {
            include: { college: true },
          },
          ideaSubmission: true,
          referral: true,
          Scores: {
            where: {
              userId: ctx.session.user.id,
            },
            include: {
              score: true,
              Judges: true,
            },
			orderBy:{
				score:{
					score:"desc"
				}
			}
          },
			videoSubmission:true
        },
        orderBy: {
          name: 'asc'
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }),
  moveToTop100: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      if (user.role !== "ORGANISER" && user.role !== "ADMIN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not allowed to perform this action",
        });
      }
      try {
        await ctx.db.team.update({
          where: {
            id: input.teamId,
          },
          data: {
            teamProgress: "SEMI_SELECTED",
          },
        });
      } catch (error) {
        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          return error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong!",
        });
      }
    }),
  moveToTop60: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      if (user.role !== "ORGANISER" && user.role !== "ADMIN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not allowed to perform this action",
        });
      }
      try {
        await ctx.db.team.update({
          where: {
            id: input.teamId,
          },
          data: {
            teamProgress: "SELECTED",
          },
        });
      } catch (error) {
        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          return error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong!",
        });
      }
    }),
  resetTeamProgress: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      if (user.role !== "ORGANISER" && user.role !== "ADMIN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not allowed to perform this action",
        });
      }
      try {
        await ctx.db.team.update({
          where: {
            id: input.teamId,
          },
          data: {
            teamProgress: "NOT_SELECTED",
          },
        });
      } catch (error) {
        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          return error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong!",
        });
      }
    }),
    resetToTop100: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      if (user.role !== "ORGANISER" && user.role !== "ADMIN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not allowed to perform this action",
        });
      }
      try {
        await ctx.db.team.update({
          where: {
            id: input.teamId,
          },
          data: {
            teamProgress: "SEMI_SELECTED",
          },
        });
      } catch (error) {
        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          return error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong!",
        });
      }
    }),
  toggleAttendance: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      if (
        user.role !== "ORGANISER" &&
        user.role !== "TEAM" &&
        user.role !== "ADMIN"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not allowed to perform this action",
        });
      }
      try {
        const team = await ctx.db.team.findUnique({
          where: {
            id: input.teamId,
          },
        });
        await ctx.db.team.update({
          where: {
            id: input.teamId,
          },
          data: {
            attended: !team?.attended,
          },
        });
      } catch (error) {
        if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
          return error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong!",
        });
      }
    }),
    getTop60:publicProcedure.query(async ({ ctx }) => {
      try {
        return ctx.db.team.findMany({
          where:{
            teamProgress:"SELECTED"
          },
          include:{
            members:{
              include:{
                college:true,
                team:true,
              }
            },
          }
        })
      } catch (error) {
        throw new TRPCError({
          code:"INTERNAL_SERVER_ERROR",
          message:"Oops! Something went wrong!"
        })
      }
    }),
  revalidateScore: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.session.user.role !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not an admin",
      });
    }
    const teams = await ctx.db.team.findMany({
      include: {
        Scores: {
          include: {
            score: true,
          },
        },
      },
    });

    await Promise.all(
      teams.map(async (team) => {
        const scores = team.Scores.map((score) => score.score.score);
        let totalScore = 0;
        scores.map((score) => {
          totalScore += parseInt(score);
        });
        return ctx.db.team.update({
          where: {
            id: team.id,
          },
          data: {
            ValidatorTotalScore: totalScore,
          },
        });
      }),
    );
  }),
});
