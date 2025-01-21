import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { addFaqZ, answerFaqZ, deleteFaqZ } from "~/server/schema/zod-schema";

export const FAQRouter = createTRPCRouter({
  addFaq: publicProcedure.input(addFaqZ).mutation(async ({ input, ctx }) => {
    try {
      await ctx.db.faq.create({
        data: {
          question: input.question,
          category: input.category,
          answer: "",
          published: false,
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

  getAllFaqs: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.faq.findMany();
  }),

  answerFaq: protectedProcedure
    .input(answerFaqZ)
    .mutation(async ({ input, ctx }) => {
      if (
        ctx.session.user.role !== "ORGANISER" &&
        ctx.session.user.role !== "ADMIN"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only Organisers can answer FAQs",
        });
      }

      try {
        await ctx.db.faq.update({
          where: {
            id: input.id,
          },
          data: {
            answer: input.answer,
            published: true,
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

  deleteFaq: protectedProcedure
    .input(deleteFaqZ)
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.faq.delete({
          where: {
            id: input.id,
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
});
