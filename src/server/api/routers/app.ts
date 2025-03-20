import { appSettingsZ } from "~/server/schema/zod-schema";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "../trpc";

export const appSettingsRouter = createTRPCRouter({
  getAppSettings: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.appSettings.findFirst();
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
});
