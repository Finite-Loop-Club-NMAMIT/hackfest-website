import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const GamefestRouter = createTRPCRouter({
    getUserTeam: protectedProcedure
        .query(async ({ ctx }) => {
            try {
                if(!ctx.session.user.gameTeam) return null;

                return await ctx.db.gameTeam.findUnique({
                    where: {
                        id: ctx.session.user.gameTeam?.id
                    },
                    include: {
                        members: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                isGameLeader: true,
                                phone: true,
                            }
                        }
                    }
                })
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Something went wrong"
                })
            }
        }),

    createTeam: protectedProcedure
        .input(z.object({
            teamName: z.string().min(3).max(30),
            game: z.enum(['VALORANT', 'BGMI'])
        }))
        .mutation(async ({ input, ctx }) => {
            const user = ctx.session.user;
            const confirmedTeams = await ctx.db.gameTeam.findMany({
                where: {
                    isConfirmed: true,
                },
            });
            if(confirmedTeams.length >= 16) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Registrations closed."
            })
            if (!user.email?.endsWith("nmamit.in"))
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only NMAMIT students are allowed to participate in Overtime",
                })

            if (user.team?.teamProgress === 'SELECTED') throw new TRPCError({
                code: "BAD_REQUEST",
                message: "You are cannot participate in Overtime as you are selected in the main event"
            })

            if (user.gameTeam) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "User already in a team"
            })
            const teamPromise = ctx.db.gameTeam.create({
                data: {
                    name: input.teamName,
                    game: input.game,
                    members: {
                        connect: {
                            id: user.id,
                        }
                    },
                }
            })

            const updatedUserPromise = ctx.db.user.update({
                where: {
                    id: user.id
                },
                data: {
                    isGameLeader: true
                }
            })

            const [team] = await Promise.all([teamPromise, updatedUserPromise]);

            return team;
        }),

    joinTeam: protectedProcedure
        .input(
            z.object({
                teamId: z.string(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const user = ctx.session.user;
            if (!user.email?.endsWith("nmamit.in"))
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only NMAMIT students are allowed to participate in Overtime",
                })

            if (user.team?.teamProgress === 'SELECTED') throw new TRPCError({
                code: "BAD_REQUEST",
                message: "You are cannot participate in Overtime as you are selected in the main event"
            })

            if (user.gameTeam)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "User already in a team",
                });

            const team = await ctx.db.gameTeam.findUnique({
                where: {
                    id: input.teamId,
                },
                include: {
                    members: true,
                },
            });
            if (!team)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Team not found",
                });
            if (
                (team.game === "VALORANT" && team.members.length === 5) ||
                (team.game === "BGMI" && team.members.length === 4)
            )
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Team is full",
                });
            const updatedUser = await ctx.db.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    gameTeam: {
                        connect: {
                            id: team.id,
                        },
                    },
                },
            });

            return updatedUser;
        }),

    leaveTeam: protectedProcedure
        .mutation(async ({ ctx }) => {
            const user = ctx.session.user;

            if (user.isGameLeader)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Leader cannot leave the team",
                });

            if (!user.gameTeam)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "User not in a team",
                });

            const team = await ctx.db.gameTeam.findUnique({
                where: {
                    id: user.gameTeam.id,
                },
                include: {
                    members: true,
                },
            });

            if (!team)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Team not found",
                });

            const updatedUser = await ctx.db.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    gameTeam: {
                        disconnect: true,
                    },
                },
            });

            return updatedUser;
        }),

    deleteTeam: protectedProcedure
        .mutation(async ({ ctx }) => {
            const user = ctx.session.user;

            if (!user.isGameLeader) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Members cannot delete the team",
                });
            }

            if (!user.gameTeam)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "User not in a game team",
                })

            await ctx.db.gameTeam.update({
                where: {
                    id: user.gameTeam?.id,
                },
                data: {
                    members: {
                        updateMany: {
                            where: {
                                teamId: user.gameTeam.id,
                            },
                            data: {
                                isGameLeader: false,
                            },
                        },
                    },
                },
            });

            await ctx.db.gameTeam.delete({
                where: {
                    id: user.gameTeam?.id,
                },
            });
        }),

    confirmTeam: protectedProcedure
        .mutation(async ({ ctx }) => {
            const user = ctx.session.user;
            if (!user.isGameLeader) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only leader can confirm team",
                });
            }
            if (!user.gameTeam) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "User not in a game team",
            });

            const team = await ctx.db.gameTeam.findUnique({
                where: {
                    id: user.gameTeam.id,
                },
                include: {
                    members: true,
                },
            });

            if (!team) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Team not found",
                });
            }


            if (
                (team.game === "VALORANT" && team.members.length !== 5) ||
                (team.game === "BGMI" && team.members.length !== 4)
            ) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Team is not full",
                });
            }

            const updatedteam = await ctx.db.gameTeam.update({
                data: {
                    isConfirmed: true,
                },
                where: {
                    id: team.id,
                },
            });

            return updatedteam;
        }),

    getTeams: protectedProcedure
    .query(async ({ctx}) => {
        return await ctx.db.gameTeam.findMany({
            include: {
                members: true
            }
        })
    })
});
