import { TRPCError } from "@trpc/server";
import { adminProcedure, chatProcedure, createTRPCRouter } from "../trpc";
import { z } from "zod";
import {
  chatMessageZ,
  createRoomZ,
  joinRoomZ,
  roomInfoZ,
} from "~/server/schema/zod-schema";
import pusherServer from "~/server/pusher";

const ROOM_LIMIT = 5;

export const chatRotuer = createTRPCRouter({
  getChatRoomList: chatProcedure.query(async ({ ctx }) => {
    try {
      const rooms = await ctx.db.userChatRoom.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        select: {
          notification: true,
          chatRoom: {
            select: {
              id: true,
              name: true,
              participants: true,
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: {
                  content: true,
                },
              },
            },
          },
        },
      });

      return rooms;
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  createRoom: adminProcedure
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

  joinRoom: adminProcedure.input(joinRoomZ).mutation(async ({ ctx, input }) => {
    const userRooms = await ctx.db.userChatRoom.findMany({
      where: { userId: ctx.session.user.id },
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

    const room = await ctx.db.$transaction(async (tx) => {
      const chatRoom = await tx.chatRoom.findUnique({
        where: {
          id: input,
          participants: {
            some: {
              userId: ctx.session.user.id,
            },
          },
        },
      });

      if (chatRoom) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Already in room",
        });
      }

      const joinedRoom = await tx.userChatRoom.create({
        data: {
          chatRoomId: input,
          userId: ctx.session.user.id,
        },
      });

      return joinedRoom;
    });

    if (room) {
      return {
        status: "success",
        message: "Successfully joined room",
        room: room,
      };
    } else {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }
  }),

  getRoomInfo: chatProcedure.input(roomInfoZ).query(async ({ ctx, input }) => {
    try {
      console.log(input);
      const room = await ctx.db.userChatRoom.findFirst({
        where: { userId: ctx.session.user.id, chatRoomId: input },
        select: {
          chatRoom: {
            select: {
              id: true,
              name: true,
              participants: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return {
        status: "success",
        message: "Room info fetched successfully",
        room: room,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        cause: error,
        message: "Something went wrong",
      });
    }
  }),

  getPreviousMessages: chatProcedure
    .input(roomInfoZ)
    .query(async ({ ctx, input }) => {
      try {
        const messages = await ctx.db.message.findMany({
          where: {
            chatRoomId: input,
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        });

        return {
          status: "success",
          message: "Fetched previous messages successfully",
          data: messages,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          cause: error,
          message: "Something went wrong",
        });
      }
    }),

  sendMessage: chatProcedure
    .input(chatMessageZ)
    .mutation(async ({ ctx, input }) => {
      try {
        const data = await ctx.db.$transaction([
          // create message
          ctx.db.message.create({
            data: {
              content: input.content,
              chatRoomId: input.roomId,
              senderId: ctx.session.user.id,
            },
            select: {
              id: true,
              content: true,
              createdAt: true,
              sender: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          }),
          // fetch other users for notification
          ctx.db.userChatRoom.findMany({
            where: {
              chatRoomId: input.roomId,
              userId: {
                not: ctx.session.user.id,
              },
            },
            select: {
              userId: true,
            },
          }),
        ]);

        if (data[0] === null) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not create message",
          });
        }

        await pusherServer.trigger(input.roomId, "new_message", {
          ...data[0],
        });

        if (data[1] !== null) {
          await Promise.all([
            data[1].map((user) =>
              pusherServer.trigger(user.userId, "notification", {
                sender: ctx.session.user.id,
                roomId: input.roomId,
                data: data[0],
              }),
            ),
          ]);
        }

        return {
          message: "Message sent successfully",
          status: "success",
          data: data[0],
        };
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          cause: error,
          message: "Something went wrong",
        });
      }
    }),
});
