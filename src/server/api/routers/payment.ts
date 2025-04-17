import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { paymentTransactionZ } from "~/server/schema/zod-schema";

export const paymentRouter = createTRPCRouter({
  createTransaction: protectedProcedure
    .input(paymentTransactionZ)
    .mutation(async ({ input, ctx }) => {
      const team = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          Team: true,
        },
      });

      if (!team?.Team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        });
      }

      if (team.Team?.teamProgress === "NOT_SELECTED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are not selected in the top 60's",
        });
      }

      if (
        team.Team?.paymentStatus === "VERIFY" ||
        team.Team?.paymentStatus === "PAID"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment already done",
        });
      }

      try {
        await ctx.db.team.update({
          where: { id: team.Team.id },
          data: {
            paymentStatus: "VERIFY",
            transactionId: input.transactionId,
            paymentProof: input.paymentProof,
          },
        });

        return {
          success: true,
          message: "Payment successful",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),

  verifyPayment: adminProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const team = await ctx.db.team.findUnique({ where: { id: input } });
      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        });
      }
      if (team.paymentStatus !== "VERIFY") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment is not pending verification",
        });
      }
      await ctx.db.team.update({
        where: { id: input },
        data: { paymentStatus: "PAID" },
      });
      return { success: true, message: "Payment verified successfully" };
    }),
});
