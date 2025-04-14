import { TRPCError } from "@trpc/server";
import { chatProcedure, createTRPCRouter } from "../trpc";
import { z } from "zod";
import { createRoomZ } from "~/server/schema/zod-schema";

const ROOM_LIMIT = 5;

export const chatRotuer = createTRPCRouter({
  getChatRoomList: chatProcedure.query(async ({ ctx }) => {
    try {
      const rooms = await ctx.db.userChatRoom.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        select: {
          chatRoom: {
            select: {
              id: true,
              name: true,
              participants: true,
              messages: {
                orderBy: { createdAt: "desc"},
                take: 1,
                select: {
                  content: true
                }
              }
            },
          },
        },
      });

      return rooms;
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  createRoom: chatProcedure
    .input(createRoomZ)
    .mutation(async ({ ctx, input }) => {
      const userRooms = await ctx.db.userChatRoom.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        select: {
          chatRoom: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (userRooms.length >= ROOM_LIMIT) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Maximum Room limit reached",
        });
      }

      const room = await ctx.db.chatRoom.create({
        data: {
          name: input,
          participants: {
            create: {
              userId: ctx.session.user.id,
            },
          },
        },
      });

      return {
        status: "success",
        message: "Successfully created room",
        room: room,
      };
    }),
});
