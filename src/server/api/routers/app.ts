import { appSettingsZ } from "~/server/schema/zod-schema";
import { z } from "zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const appSettingsRouter = createTRPCRouter({
  getAppSettings: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.appSettings.findFirst();
  }),
  isResultOpen: publicProcedure.query(async ({ ctx }) => {
    const appSettings = await ctx.db.appSettings.findFirst();
    return appSettings?.isResultOpen;
  }),
  
  getHackfestStartTime: publicProcedure.query(async ({ ctx }) => {
    const appSettings = await ctx.db.appSettings.findFirst();
    return appSettings?.isHackfestStarted;
  }),

  isWinnersDeclared: publicProcedure.query(async ({ ctx }) => {
    const appSettings = await ctx.db.appSettings.findFirst();
    return appSettings?.isWinnersDeclared;
  }),
  
  setResultVisibility: adminProcedure
    .input(z.boolean())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.appSettings.update({
        where: { id: 1 },
        data: {
          isResultOpen: input,
        },
      });
      return await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "App Settings",
          description: `Results visibility set to ${input ? "visible" : "hidden"}`,
        },
      });
    }),

  setRegistrationStatus: adminProcedure
    .input(z.boolean())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.appSettings.update({
        where: { id: 1 },
        data: {
          isRegistrationOpen: input,
        },
      });
      return await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "App Settings",
          description: `Registration ${input ? "opened" : "closed"}`,
        },
      });
    }),

  setPaymentStatus: adminProcedure
    .input(z.boolean())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.appSettings.update({
        where: { id: 1 },
        data: {
          isPaymentOpen: input,
        },
      });
      return await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "App Settings",
          description: `Payment ${input ? "opened" : "closed"}`,
        },
      });
    }),

  setProfileEditStatus: adminProcedure
    .input(z.boolean())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.appSettings.update({
        where: { id: 1 },
        data: {
          isProfileEditOpen: input,
        },
      });
      return await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "App Settings",
          description: `Profile editing ${input ? "enabled" : "disabled"}`,
        },
      });
    }),

  setTop60ValidationStatus: adminProcedure
    .input(z.boolean())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.appSettings.update({
        where: { id: 1 },
        data: {
          isTop60Validated: input,
        },
      });
      return await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "App Settings",
          description: `Top 60 validation status set to ${input ? "validated" : "not validated"}`,
        },
      });
    }),

  setEventStatus: adminProcedure
    .input(z.boolean())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.appSettings.update({
        where: { id: 1 },
        data: {
          isEventStarted: input,
        },
      });
      return await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "App Settings",
          description: `Event status set to ${input ? "started" : "not started"}`,
        },
      });
    }),
  
  setWinnersDeclaredStatus: adminProcedure
    .input(z.boolean())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.appSettings.update({
        where: { id: 1 },
        data: {
          isWinnersDeclared: input,
        },
      });
      return await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "App Settings",
          description: `Winners declared status set to ${input ? "declared" : "not declared"}`,
        },
      });
    }),
  
  setHackfestStartTime: adminProcedure
    .input(z.boolean())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.appSettings.update({
        where: { id: 1 },
        data: {
          isHackfestStarted: input ? new Date() : null,
        },
      });
      return await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "App Settings",
          description: `Hackfest start time ${input ? "set to current time" : "reset to null"}`,
        },
      });
    }),
  
  updateAppSettings: adminProcedure
    .input(appSettingsZ)
    .mutation(async ({ ctx, input }) => {
      const filteredInput = Object.fromEntries(
        Object.entries(input).filter(([_, value]) => value !== null),
      );

      await ctx.db.appSettings.update({
        where: { id: 1 },
        data: {
          ...filteredInput,
        },
      });
      return await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "App Settings",
          description: `App settings have been updated`,
        },
      });
    }),

  createChatRooms: adminProcedure.mutation(async ({ ctx }) => {
    // parallelize the queries to get admins and teams
    const [admins, teams] = await ctx.db.$transaction([
      ctx.db.user.findMany({
        where: {
          role: "ADMIN",
        },
        select: {
          id: true,
        },
      }),
      ctx.db.team.findMany({
        where: {
          attended: true,
        },
        select: {
          id: true,
          teamNo: true,
          Members: {
            select: {
              id: true,
            },
          },
        },
      }),
    ]);

    if(admins.length === 0 || teams.length === 0) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch admins and teams"
      })
    }

    try {
      // create rooms for each teams
      for (const team of teams) {
        await ctx.db.chatRoom.create({
          data: {
            name: "HF25-" + team.teamNo,
            participants: {
              createMany: {
                data: [
                  ...admins.map((admin) => ({
                    userId: admin.id,
                  })),
                  ...team.Members.map((member) => ({
                    userId: member.id,
                  })),
                ],
                skipDuplicates: true,
              },
            },
          },
        });
      }

      return {
        message: "Chat rooms created successfully",
        status: "success"
      }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create chat rooms",
      });
    }
  }),
});
