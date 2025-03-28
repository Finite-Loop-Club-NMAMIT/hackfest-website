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
import { dashboardProcedure } from "~/server/api/trpc";
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
        await ctx.db.auditLog.create({
          data: {
            sessionUser: ctx.session.user.email,
            auditType: "TEAM",
            description: `Team ${input.teamName} created by ${user.email} `,
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

      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "TEAM",
          description: `Team ${team?.name} joined by ${user.email} `,
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

      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "TEAM",
          description: `Team ${team?.name} joined by ${user.email} `,
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
      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "TEAM",
          description: `User ${user?.id} has left team ${team?.name} `,
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
        await ctx.db.auditLog.create({
          data: {
            sessionUser: ctx.session.user.email,
            auditType: "TEAM",
            description: `Team ${team?.name} is incomplete`,
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
      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "TEAM",
          description: `Team ${user.team?.id} has been deleted`,
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

  getTeamsList: dashboardProcedure.query(async ({ ctx }) => {
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
  moveToTop100: dashboardProcedure
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
      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "TEAM",
          description: `Team ${input.teamId} has been moved to Top 100`,
        },
      });
    }),
  moveToTop60: dashboardProcedure
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
      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "TEAM",
          description: `Team ${input.teamId} has been moved to Top 60`,
        },
      });
    }),
  resetTeamProgress: dashboardProcedure
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
      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "TEAM",
          description: `Team ${input.teamId} has been reset`,
        },
      });
    }),
  resetToTop100: dashboardProcedure
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
      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "TEAM",
          description: `Team ${input.teamId} has been reset to Top 100`,
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
      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "TEAM",
          description: `Attendance for team ${input.teamId} has been updated`,
        },
      });
    }),

  getTop60: dashboardProcedure.query(async ({ ctx }) => {
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

  getTop60Selected: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.team.findMany({
      where: {
        teamProgress: "SELECTED",
      },
      include: {
        IdeaSubmission:{
          select:{
            track:true,
          }
        },
        Members: {
          select: {
            College: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }),
  getStatistics: dashboardProcedure.query(async ({ ctx }) => {
    const allTeams = await ctx.db.team.findMany({
      include: {
        Members: {
          select: {
            id: true,
            name: true,
            College: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Get unique states from the college table
    const collegeStates = await ctx.db.college.findMany({
      select: {
        state: true,
      },
    });

    const team = await ctx.db.team.findMany({
      select: {
        id: true,
        isComplete: true,
      },
      where: {
        isComplete: true,
      },
    });
    // Count stats
    const teamsConfirmed = team.length;
    const uniqueStates = new Set();
    const uniqueColleges = new Set();
    let internalCount = 0;
    let externalCount = 0;
    let totalParticipants = 0;

    // Add states from colleges to uniqueStates set
    collegeStates.forEach((college) => {
      if (
        college.state &&
        typeof college.state === "string" &&
        college.state.trim() !== ""
      ) {
        uniqueStates.add(college.state);
      }
    });

    allTeams.forEach((team) => {
      team.Members.forEach((member) => {
        totalParticipants++;
        if (member.College?.name) uniqueColleges.add(member.College.name);
        if (member.College?.name === "NMAM Institute of Technology") {
          internalCount++;
        } else {
          externalCount++;
        }
      });
    });

    return {
      uniqueStatesCount: uniqueStates.size,
      uniqueCollegesCount: uniqueColleges.size,
      internalCount,
      externalCount,
      totalParticipants,
      teamsConfirmed,
      states: Array.from(uniqueStates),
    };
  }),

  getTeamsByTotalScore: dashboardProcedure.query(async ({ ctx }) => {
    // Get all teams with their scores
    const teams = await ctx.db.team.findMany({
      include: {
        Members: {
          select: {
            id: true,
            name: true,
            isLeader : true,
            image: true,
            phone: true,
            email: true,
            College: {
              select: {
                name: true,
              },
            },
          },
        },
        IdeaSubmission: {
          select: {
            track: true,
            pptUrl: true,
          },
        },
        Scores: {
          select: {
            score: true,
            Judge: {
              select: {
                type: true,
              },
            },
          },
        },
        VideoSubmission: true,
      },
    });

    // Calculate total scores for each team (only counting VALIDATOR scores)
    const teamsWithTotalScores = teams.map(team => {
      const validatorScores = team.Scores.filter(score => 
        score.Judge.type === "VALIDATOR" || score.Judge.type === "SUPER_VALIDATOR"
      );
      
      const totalScore = validatorScores.reduce((sum, score) => sum + score.score, 0);
      
      return {
        ...team,
        totalScore,
      };
    });

    // Sort teams by total score in descending order
    teamsWithTotalScores.sort((a, b) => b.totalScore - a.totalScore);

    return teamsWithTotalScores;
  }),

  getTeamMembersDetails: dashboardProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      const members = await ctx.db.user.findMany({
        where: {
          teamId: input.teamId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          phone: true,
          isLeader: true,
          course: true,
          tShirtSize: true,
          state: true,
          github: true,
          College: {
            select: {
              name: true,
              state: true,
            },
          },
        },
        orderBy: {
          isLeader: 'desc',
        },
      });

      return members;
    }),
});
