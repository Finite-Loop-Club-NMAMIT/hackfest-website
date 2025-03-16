
import type { TeamNames } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  teamProcedure,
} from "~/server/api/trpc";
import {
  createTeamZ,
  getTeamDetailsByIdZ,
  joinTeamZ,
} from "~/server/schema/zod-schema";

export const teamRouter = createTRPCRouter({
  fetchTeamNames: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.$queryRaw<
      TeamNames[]
    >`SELECT * FROM "TeamNames" ORDER BY RANDOM() LIMIT 3`;
  }),
  checkTeamById: protectedProcedure
    .input(joinTeamZ)
    .query(async ({ input, ctx }) => {
      try {
        const team = await ctx.db.team.findFirst({
          where: { id: input.teamId },
          select: {
            id: true,
            name: true,
            Members: {
              select: {
                id: true,
                name: true,
                isLeader: true,
                image: true,
              },
            },
          },
        });

        if (team?.id) {
          return {
            status: "success",
            message: "Team exists",
            team: team,
          };
        } else {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Team does not exist",
          });
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),

  getTeamDetails: protectedProcedure.query(async ({ ctx }) => {
    try {
      const team = await ctx.db.team.findFirst({
        where: { id: ctx.session.user.team?.id },
        select: {
          id: true,
          name: true,
          Members: {
            select: {
              id: true,
              name: true,
              isLeader: true,
              image: true,
              github: true,
            },
          },
        },
      });

      if (team?.id) {
        return {
          status: "success",
          message: "Team exists",
          team: team,
        };
      } else {
        return {
          status: "failure",
          message: "Team does not exists",
          team: null,
        };
      }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }
  }),

  getTeamSize: protectedProcedure.query(async ({ ctx }) => {
    const teamId = ctx.session.user.team?.id;
    try {
      if (teamId) {
        const length = await ctx.db.user.count({ where: { teamId: teamId } });

        return {
          status: "success",
          teamsize: length,
        };
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are now logged in",
        });
      }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }
  }),

  createTeam: protectedProcedure
    .input(createTeamZ)
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      if (user.team) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already in a team",
        });
      }

      if (
        user.profileProgress !== "FORM_TEAM" &&
        user.profileProgress !== "SUBMIT_IDEA"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Please complete your profile first",
        });
      }

      try {
        const result = await ctx.db.user.update({
          where: {
            id: user.id,
          },
          data: {
            isLeader: true,
            Team: {
              create: {
                name: input.teamName,
              },
            },
          },
        });

        await ctx.db.teamNames.delete({
          where: {
            name: input.teamName,
          },
        });
        return {
          status: "success",
          message: "Team created successfully",
          team: {
            id: result.teamId,
            name: input.teamName,
          },
        };
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),

  joinTeam: protectedProcedure
    .input(joinTeamZ)
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      if (user?.team) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already in a team",
        });
      }

      if (
        user?.profileProgress !== "FORM_TEAM" &&
        user?.profileProgress !== "SUBMIT_IDEA"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Please complete your profile first",
        });
      }

      const team = await ctx.db.team.findFirst({
        where: {
          id: input.teamId,
        },
        include: {
          Members: {
            include: { College: true },
          },
          IdeaSubmission: true,
        },
      });
      if (!team) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
      }

      if (team.IdeaSubmission) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Idea already submitted",
        });
      }

      if (team.Members.length >= 4) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Team is full" });
      }

      const leader = team.Members.find((member) => member.isLeader === true);
      if (user.college !== leader?.College?.name) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Team members should be from same college only",
        });
      }
      const res = await ctx.db.team.update({
        where: {
          id: input.teamId,
        },
        data: {
          Members: {
            connect: {
              id: user?.id,
            },
          },
        },
        include: {
          Members: true,
        },
      });

      const isComplete = res.Members.length === 3 || res.Members.length === 4;
      const joinedTeam = await ctx.db.team.update({
        where: {
          id: input.teamId,
        },
        data: {
          isComplete,
        },
      });
      return {
        status: "success",
        message: "Joined team successfully",
        team: {
          id: joinedTeam.id,
          name: joinedTeam.name,
        },
      };
    }),

  leaveTeam: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const user = ctx.session.user;
      await ctx.db.user.update({
        where: {
          id: user?.id,
        },
        data: {
          Team: {
            disconnect: true,
          },
          profileProgress: "FORM_TEAM",
        },
      });
      const team = await ctx.db.team.findFirst({
        where: {
          id: user?.team?.id,
        },
        include: {
          Members: true,
        },
      });
      const isComplete =
        team?.Members.length === 3 || team?.Members.length === 4;
      if (!isComplete) {
        await ctx.db.user.updateMany({
          where: {
            teamId: team?.id,
          },
          data: {
            profileProgress: "FORM_TEAM",
          },
        });
      }
      if (team?.isComplete && isComplete) {
        await ctx.db.team.update({
          where: {
            id: user?.team?.id,
          },
          data: {
            isComplete,
          },
        });
      }
      return { status: "success", message: "Left team successfully" };
    } catch (error) {
      console.log(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }
  }),

  deleteTeam: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const user = ctx.session.user;

      if (!user?.isLeader) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are not the leader of this team",
        });
      }

      await ctx.db.team.update({
        data: {
          Members: {
            updateMany: {
              where: {
                teamId: user.team?.id,
              },
              data: {
                profileProgress: "FORM_TEAM",
                isLeader: false,
              },
            },
          },
        },
        where: {
          id: user.team?.id,
        },
      });

      await ctx.db.team.delete({
        where: {
          id: user.team?.id,
        },
      });

      return { status: "success", message: "Team deleted successfully" };
    } catch (error) {
      console.log(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }
  }),

  getTeamDetailsById: protectedProcedure
    .input(getTeamDetailsByIdZ)
    .query(async ({ input, ctx }) => {
      if (!input.teamId || input.teamId.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Team not found" });
      }
      const team = await ctx.db.team.findUnique({
        where: {
          id: input.teamId,
        },
        include: {
          Members: {
            include: {
              College: true,
            },
          },
          IdeaSubmission: true,
          Scores: true,
          Remark: true,
        },
      });
      return team;
    }),

  getTeamsList: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.team.findMany({
      include: {
        Members: {
          include: { College: true },
        },
        IdeaSubmission: true,
        Scores: true,
        VideoSubmission: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }),
  top15: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.team.findMany({
      where: {
        teamProgress: "TOP15",
      },
      include: {
        Members: {
          include: { College: true },
        },
        IdeaSubmission: true,
        Scores: true,
        VideoSubmission: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }),
  moveToTop100: adminProcedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.team.update({
        where: {
          id: input.teamId,
        },
        data: {
          teamProgress: "SEMI_SELECTED",
        },
      });
    }),
  moveToTop60: adminProcedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.team.update({
        where: {
          id: input.teamId,
        },
        data: {
          teamProgress: "SELECTED",
        },
      });
    }),
  resetTeamProgress: adminProcedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.team.update({
        where: {
          id: input.teamId,
        },
        data: {
          teamProgress: "NOT_SELECTED",
        },
      });
    }),
  resetToTop100: adminProcedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.team.update({
        where: {
          id: input.teamId,
        },
        data: {
          teamProgress: "SEMI_SELECTED",
        },
      });
    }),
  toggleAttendance: teamProcedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
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
    }),
  getTop60: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.team.findMany({
      where: {
        teamProgress: "SELECTED",
      },
      include: {
        Members: {
          include: {
            College: true,
            Team: true,
          },
        },
      },
    });
  }),
});
