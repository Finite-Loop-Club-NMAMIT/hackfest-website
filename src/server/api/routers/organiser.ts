import { TeamProgress, JudgeType, Role } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, createTRPCRouter, dashboardProcedure, publicProcedure } from "~/server/api/trpc";
import { addJudge } from "~/server/schema/zod-schema";
import { Dormitory, Arena } from "@prisma/client";

const criteriaInputBase = z.object({
  criteria: z.string().min(1, "Criteria name cannot be empty"),
  maxScore: z.number().int().positive("Max score must be a positive integer"),
  judgeType: z.nativeEnum(JudgeType),
});

const addCriteriaInput = criteriaInputBase;

const updateCriteriaInput = criteriaInputBase.extend({
  id: z.string(),
});

const deleteCriteriaInput = z.object({
  id: z.string(),
});

export const organiserRouter = createTRPCRouter({
  getJudgesList: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.judge.findMany({
      select: {
        id: true,
        type: true,
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }),
  
  addJudge: adminProcedure.input(addJudge).mutation(async ({ input, ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: {
         id: input.userId 
        },
      select: { 
        id: true, 
        role: true, 
        Judge: true 
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    await ctx.db.$transaction(async (tx) => {
      await tx.judge.create({
        data: {
          id: input.userId,
          type: input.type,
          User: {
            connect: { id: input.userId }
          }
        }
      });

      const role = input.type === "VALIDATOR" 
        ? Role.VALIDATOR 
        : input.type === "SUPER_VALIDATOR"
          ? Role.SUPER_VALIDATOR
          : Role.JUDGE;

      await tx.user.update({
        where: { 
          id: input.userId 
        },
        data: { 
          role
         }
      });

      await tx.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "Role Change",
          description: `User ${input.userId} has been assigned as a ${input.type}`
        }
      });
    });
  }),
  
  removeJudge: dashboardProcedure
    .input(
      z.object({
        userId: z.string(),
        judgeId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const judge = await ctx.db.judge.findFirst({
          where: {
            id: input.judgeId,
          },
          include: {
            User: true
          }
        });
        
        if (!judge) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Judge not found",
          });
        }
        
        await ctx.db.$transaction(async (tx) => {
            const user = await ctx.db.user.findUnique({
              where: { id: input.userId },
              select: { role: true }
              });
              if (!user) {
                throw new Error("User not found");
              }
  
              if (user?.role !== Role.PARTICIPANT) {
              await ctx.db.user.update({
                where: {
                id: input.userId,
                },
                data: {
                role: Role.PARTICIPANT,
                },
              });
              }

          await tx.judge.delete({
            where: {
              id: input.judgeId,
            },
          });

          return await tx.auditLog.create({
            data: {
              sessionUser: ctx.session.user.email,
              auditType: "Role Change",
              description: `User ${input.userId} has been removed as a Judge`,
            },
          });
        });
      } catch (error) {
        console.error("Error removing judge:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to delete judge";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: errorMessage,
          cause: error,
        });
      }
    }),
    
  getVolunteerList: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findMany({
      where: {
        role: "TEAM",
      },
    });
  }),
  
  addVolunteer: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.user.update({
        where: {
          id: input.id,
        },
        data: {
          role: "TEAM",
        },
      });
      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "Role Change",
          description: `User ${input.id} has been assigned as a Volunteer`,
        },
      });
    }),
    
  removeVolunteer: adminProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.user.update({
        where: {
          id: input.userId,
        },
        data: {
          role: "PARTICIPANT",
        },
      });
      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "Role Change",
          description: `User ${input.userId} has been removed as a Volunteer`,
        },
      });
    }),
    
  changeTeamProgress: dashboardProcedure
    .input(
      z.object({
        teamId: z.string(),
        progress: z.nativeEnum(TeamProgress),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      let isAuthorized = false;
      let judgeType: JudgeType | null = null;

      if (user.role === Role.ADMIN) {
        isAuthorized = true;
      }
      else if (user.role === Role.JUDGE) {
         const judge = await ctx.db.judge.findUnique({
           where: { id: user.id },
           select: { type: true }
         });
         if (judge?.type === JudgeType.DAY3_FINALS) {
           isAuthorized = true;
           judgeType = judge.type;
         }
      }

      if (!isAuthorized) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to perform this action",
        });
      }

      const day3AllowedProgresses: ReadonlyArray<TeamProgress> = [TeamProgress.SELECTED, TeamProgress.TOP15];

      if (judgeType === JudgeType.DAY3_FINALS) {
        if (!day3AllowedProgresses.includes(input.progress)) {
           throw new TRPCError({
             code: "BAD_REQUEST",
             message: "Day 3 judges can only set progress to SELECTED or TOP15.",
           });
        }
        const currentTeam = await ctx.db.team.findUnique({
            where: { id: input.teamId },
            select: { teamProgress: true }
        });
        if (!currentTeam || !day3AllowedProgresses.includes(currentTeam.teamProgress)) {
             throw new TRPCError({
               code: "BAD_REQUEST",
               message: "Team is not currently in SELECTED or TOP15 state for Day 3 judging.",
             });
        }
      }

      const team = await ctx.db.team.findUnique({
        where: {
          id: input.teamId,
        },
      });
      if (!team)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        });

      const updatedTeam = await ctx.db.team.update({
        where: {
          id: input.teamId,
        },
        data: {
          teamProgress: input.progress,
        },
      });

      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "TEAM_PROGRESS",
          description: `${user.role === Role.ADMIN ? 'Admin' : `Judge (${judgeType})`} ${user.email} updated Team ${input.teamId} progress to ${input.progress}`,
        },
      });
      return updatedTeam;
    }),
    
  updateTeamProgressFromScoring: adminProcedure
    .input(
      z.object({
        teamId: z.string(),
        progress: z.nativeEnum(TeamProgress),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const team = await ctx.db.team.findUnique({
        where: {
          id: input.teamId,
        },
        select: {
          id: true,
          name: true,
          teamProgress: true,
        }
      });
      
      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        });
      }
      
      // Define allowed progress transitions based on current status
      let allowedProgressValues: TeamProgress[];
      
      if (team.teamProgress === TeamProgress.TOP15) {
        // TOP15 can be promoted to winner categories or demoted to SELECTED
        allowedProgressValues = [
          TeamProgress.SELECTED, 
          TeamProgress.TOP15, 
          TeamProgress.WINNER, 
          TeamProgress.RUNNER, 
          TeamProgress.SECOND_RUNNER, 
          TeamProgress.TRACK
        ];
      } else if (team.teamProgress === TeamProgress.SELECTED) {
        // SELECTED can only be promoted to TOP15
        allowedProgressValues = [TeamProgress.SELECTED, TeamProgress.TOP15];
      } else if ([
        TeamProgress.WINNER,
        TeamProgress.RUNNER,
        TeamProgress.SECOND_RUNNER,
        TeamProgress.TRACK
      ].includes(team.teamProgress as unknown as (typeof TeamProgress.WINNER | typeof TeamProgress.RUNNER | typeof TeamProgress.SECOND_RUNNER | typeof TeamProgress.TRACK))) {
        // Winners can be demoted back to TOP15
        allowedProgressValues = [
          team.teamProgress, 
          TeamProgress.TOP15
        ];
      } else {
        // For any other status, only allow same status to prevent mistakes
        allowedProgressValues = [team.teamProgress];
      }
      
      if (!allowedProgressValues.includes(input.progress)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invalid progress transition from ${team.teamProgress} to ${input.progress}`,
        });
      }
      
      // Update the team's progress
      const updatedTeam = await ctx.db.team.update({
        where: {
          id: input.teamId,
        },
        data: {
          teamProgress: input.progress,
        },
      });
      
      // Log the action
      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "TEAM_PROGRESS_FROM_SCORING",
          description: `Admin ${ctx.session.user.email} updated Team ${team.name} (${input.teamId}) progress from ${team.teamProgress} to ${input.progress} via scoring interface`,
        },
      });
      
      return updatedTeam;
    }),

  getCollegeAnalytics: adminProcedure.query(async ({ ctx }) => {
    const colleges = await ctx.db.college.findMany({
      select: {
        id: true,
        name: true,
        state: true,
        User: {
          select: {
            id: true,
            teamId: true,
            Team: {
              select: {
                id: true,
                isComplete: true,
                paymentStatus: true,
                teamProgress: true,
              }
            }
          }
        }
      }
    });

    const collegeAnalytics = colleges.map(college => {
      const uniqueTeamIds = new Set<string>();
      const confirmedTeamIds = new Set<string>();
      const selectedTeamIds = new Set<string>();

      college.User.forEach(user => {
        if (user.teamId) {
          uniqueTeamIds.add(user.teamId);
          
          if (user.Team?.isComplete === true) {
            confirmedTeamIds.add(user.teamId);
          }
          
          if (user.Team?.teamProgress === 'SELECTED') {
            selectedTeamIds.add(user.teamId);
          }
        }
      });

      return {
        id: college.id,
        name: college.name,
        state: college.state,
        totalTeams: uniqueTeamIds.size,
        confirmedTeams: confirmedTeamIds.size,
        selectedTeams: selectedTeamIds.size,
      };
    });

    const totalColleges = collegeAnalytics.length;
    const collegesWithConfirmedTeams = collegeAnalytics.filter(c => c.confirmedTeams > 0).length;
    const collegesWithSelectedTeams = collegeAnalytics.filter(c => c.selectedTeams > 0).length;
    
    const sortedColleges = [...collegeAnalytics].sort((a, b) => 
      b.selectedTeams - a.selectedTeams || b.confirmedTeams - a.confirmedTeams
    );

    const stateAnalytics: Record<string, {
      totalColleges: number;
      collegesWithConfirmedTeams: number;
      collegesWithSelectedTeams: number;
      totalTeams: number;
      confirmedTeams: number;
      selectedTeams: number;
      colleges: typeof collegeAnalytics;
    }> = {};

    collegeAnalytics.forEach(college => {
      const stateName = college.state.toString();
      if (!stateAnalytics[stateName]) {
        stateAnalytics[stateName] = {
          totalColleges: 0,
          collegesWithConfirmedTeams: 0,
          collegesWithSelectedTeams: 0,
          totalTeams: 0,
          confirmedTeams: 0,
          selectedTeams: 0,
          colleges: []
        };
      }
      
      stateAnalytics[stateName].colleges.push(college);
      stateAnalytics[stateName].totalColleges++;
      stateAnalytics[stateName].totalTeams += college.totalTeams;
      stateAnalytics[stateName].confirmedTeams += college.confirmedTeams;
      stateAnalytics[stateName].selectedTeams += college.selectedTeams;
      
      if (college.confirmedTeams > 0) {
        stateAnalytics[stateName].collegesWithConfirmedTeams++;
      }
      if (college.selectedTeams > 0) {
        stateAnalytics[stateName].collegesWithSelectedTeams++;
      }
    });
    
    const sortedStates = Object.entries(stateAnalytics)
      .map(([state, data]) => ({ state, ...data }))
      .sort((a, b) => b.selectedTeams - a.selectedTeams || b.confirmedTeams - a.confirmedTeams);

    return {
      totalColleges,
      collegesWithConfirmedTeams,
      collegesWithSelectedTeams,
      collegeBreakdown: sortedColleges,
      stateAnalytics: sortedStates
    };
  }),
  
  getCollegeTeams: adminProcedure
    .input(
      z.object({
        collegeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { collegeId } = input;
      
      const collegeUsers = await ctx.db.user.findMany({
        where: {
          collegeId: collegeId,
          teamId: {
            not: null
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isLeader: true,
          teamId: true,
        }
      });
      
      const teamIds = [...new Set(collegeUsers.map(user => user.teamId).filter(Boolean))];
      
      const teams = await ctx.db.team.findMany({
        where: {
          id: {
            in: teamIds as string[]
          },
          teamProgress: 'SELECTED'
        },
        include: {
          Members: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              tShirtSize: true,
              github: true,
              isLeader: true,
              College: {
                select: {
                  name: true
                }
              }
            }
          },
          IdeaSubmission: true,
          Scores: {
            include: {
              Criteria: true
            }
          },
          Remark: true
        }
      });
      
      return {
        teams,
        college: await ctx.db.college.findUnique({
          where: { id: collegeId },
          select: { name: true, state: true }
        })
      };
    }),
    
  getAllTeamsForAllocation: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.team.findMany({
      where: {
        OR: [
          { teamProgress: 'SELECTED' },
          { teamProgress: 'TOP15' },
          { teamProgress: 'WINNER' },
          { teamProgress: 'RUNNER' },
          { teamProgress: 'SECOND_RUNNER' },
          { teamProgress: 'TRACK' }
        ]
      },
      select: {
        id: true,
        name: true,
        teamNo: true,
        teamProgress: true,
        boysDormitory: true,
        girlsDormitory: true,
        arena: true,
        Members: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { teamNo: 'asc' }
    });
  }),
  
  updateTeamAllocation: adminProcedure
    .input(
      z.object({
        teamId: z.string(),
        boysDormitory: z.nativeEnum(Dormitory).optional(),
        girlsDormitory: z.nativeEnum(Dormitory).optional(),
        arena: z.nativeEnum(Arena).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { teamId, boysDormitory, girlsDormitory, arena } = input;
      
      // Remove the arena uniqueness check that was here
      
      const updateData: { boysDormitory?: Dormitory; girlsDormitory?: Dormitory; arena?: Arena } = {};
      if (boysDormitory !== undefined) updateData.boysDormitory = boysDormitory;
      if (girlsDormitory !== undefined) updateData.girlsDormitory = girlsDormitory;
      if (arena !== undefined) updateData.arena = arena;
      
      const updatedTeam = await ctx.db.team.update({
        where: { id: teamId },
        data: updateData
      });
      
      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "TEAM_ALLOCATION",
          description: `Team ${teamId} allocation updated: ${String(JSON.stringify(updateData))}`,
        }
      });
      
      return updatedTeam;
    }),
    
  getAllocationSummary: adminProcedure.query(async ({ ctx }) => {
    const teams = await ctx.db.team.findMany({
      where: {
        OR: [
          { boysDormitory: { not: null } },
          { girlsDormitory: { not: null } },
          { arena: { not: null } }
        ]
      },
      select: {
        boysDormitory: true,
        girlsDormitory: true,
        arena: true
      }
    });
    
    const arenaCounts: Record<string, number> = {
      ADL01: 0,
      ADL03: 0,
      ADL04: 0,
      SMV54: 0,
      SMV55: 0,
      NOT_ASSIGNED: 0
    };
    
    const dormitoryCounts: Record<string, number> = {
      NC61: 0,
      NC62: 0,
      NC63: 0,
      SMV54: 0,
      SMV55: 0,
      SMV56: 0,
      NOT_ASSIGNED: 0
    };
    
    teams.forEach(team => {
      if (team.arena) {
        arenaCounts[team.arena] = (arenaCounts[team.arena] ?? 0) + 1;
      }
      if (team.boysDormitory) {
        dormitoryCounts[team.boysDormitory] = (dormitoryCounts[team.boysDormitory] ?? 0) + 1;
      }
      if (team.girlsDormitory) {
        dormitoryCounts[team.girlsDormitory] = (dormitoryCounts[team.girlsDormitory] ?? 0) + 1;
      }
    });
    
    return {
      arenaCounts,
      dormitoryCounts,
      totalTeams: teams.length
    };
  }),

  getCriteria: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.criteria.findMany({
      orderBy: { JudgeType: 'asc' }
    });
  }),

  addCriteria: adminProcedure
    .input(addCriteriaInput)
    .mutation(async ({ ctx, input }) => {
      const newCriteria = await ctx.db.criteria.create({
        data: {
          criteria: input.criteria,
          maxScore: input.maxScore,
          JudgeType: input.judgeType,
        },
      });

      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "CRITERIA_ADD",
          description: `Admin ${ctx.session.user.email} added criteria: ${input.criteria} (Max: ${input.maxScore}, Type: ${input.judgeType})`,
        },
      });

      return newCriteria;
    }),

  updateCriteria: adminProcedure
    .input(updateCriteriaInput)
    .mutation(async ({ ctx, input }) => {
      const updatedCriteria = await ctx.db.criteria.update({
        where: { id: input.id },
        data: {
          criteria: input.criteria,
          maxScore: input.maxScore,
          JudgeType: input.judgeType,
        },
      });

      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "CRITERIA_UPDATE",
          description: `Admin ${ctx.session.user.email} updated criteria ID ${input.id} to: ${input.criteria} (Max: ${input.maxScore}, Type: ${input.judgeType})`,
        },
      });

      return updatedCriteria;
    }),

  deleteCriteria: adminProcedure
    .input(deleteCriteriaInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const existingScores = await ctx.db.scores.count({
          where: { criteriaId: input.id },
        });

        if (existingScores > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Cannot delete criteria because related scores exist. Please remove associated scores first.",
          });
        }

        const deletedCriteria = await ctx.db.criteria.delete({
          where: { id: input.id },
        });

        await ctx.db.auditLog.create({
          data: {
            sessionUser: ctx.session.user.email,
            auditType: "CRITERIA_DELETE",
            description: `Admin ${ctx.session.user.email} deleted criteria: ${deletedCriteria.criteria} (ID: ${input.id})`,
          },
        });

        return { success: true, id: input.id };
      } catch (error) {
         if (error instanceof TRPCError) {
           throw error;
         }
         console.error("Error deleting criteria:", error);
         throw new TRPCError({
           code: "INTERNAL_SERVER_ERROR",
           message: "Failed to delete criteria.",
           cause: error,
         });
      }
    }),

  getTeamScores: dashboardProcedure.query(async ({ ctx }) => {
    const teams = await ctx.db.team.findMany({
      where: {
        teamProgress: {
          in: ['SELECTED', 'TOP15','WINNER', 'RUNNER', 'SECOND_RUNNER', 'TRACK']
        }
      },
      select: {
        id: true,
        name: true,
        teamNo: true,
        teamProgress: true,
        Members: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            College: {
              select: {
                name: true
              }
            }
          }
        },
        IdeaSubmission: {
          select: {
            track: true,
            pptUrl: true
          }
        },
        Scores: {
          where: {
            Criteria: {
              JudgeType: {
                in: [JudgeType.DAY2_ROUND1, JudgeType.DAY2_ROUND2]
              }
            }
          },
          include: {
            Criteria: true,
            Judge: {
              include: {
                User: {
                  select: {
                    name: true,
                  }
                }
              }
            }
          }
        },
        Remark: {
          include: {
            Judge: {
              include: {
                User: {
                  select: {
                    name: true,
                    id: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { teamNo: 'asc' }
      ]
    });

    // Remove judge scoring ranges for normalization
    const allCriteria = await ctx.db.criteria.findMany({
      where: {
        JudgeType: {
          in: [JudgeType.DAY2_ROUND1, JudgeType.DAY2_ROUND2]
        }
      },
      orderBy: [
        { JudgeType: 'asc' },
        { criteria: 'asc' }
      ]
    });

    const judges = await ctx.db.judge.findMany({
      where: {
        type: {
          in: [JudgeType.DAY2_ROUND1, JudgeType.DAY2_ROUND2]
        }
      },
      include: {
        User: {
          select: {
            name: true,
            id: true
          }
        }
      }
    });

    return {
      teams,
      criteria: allCriteria,
      judges
    };
  }),
  getTeamWinners: publicProcedure.query(async ({ ctx }) => {
    const teams = await ctx.db.team.findMany({
      where: {
        teamProgress: {
          in: ['SELECTED', 'TOP15','WINNER', 'RUNNER', 'SECOND_RUNNER', 'TRACK']
        }
      },
      select: {
        id: true,
        name: true,
        teamNo: true,
        teamProgress: true,
        Members: {
          select: {
            id: true,
            name: true,
            College: {
              select: {
                name: true
              }
            }
          }
        },
        IdeaSubmission: {
          select: {
            track: true,
            pptUrl: true
          }
        }
      },
      orderBy: [
        { teamNo: 'asc' }
      ]
    });

    // Remove judge scoring ranges for normalization
    const allCriteria = await ctx.db.criteria.findMany({
      where: {
        JudgeType: {
          in: [JudgeType.DAY2_ROUND1, JudgeType.DAY2_ROUND2]
        }
      },
      orderBy: [
        { JudgeType: 'asc' },
        { criteria: 'asc' }
      ]
    });

    const judges = await ctx.db.judge.findMany({
      where: {
        type: {
          in: [JudgeType.DAY2_ROUND1, JudgeType.DAY2_ROUND2]
        }
      },
      include: {
        User: {
          select: {
            name: true,
            id: true
          }
        }
      }
    });

    return {
      teams,
      criteria: allCriteria,
      judges
    };
  }),
});
