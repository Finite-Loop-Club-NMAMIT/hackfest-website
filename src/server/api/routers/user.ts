import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  editProfileZ,
  updateProfileZ,
  updateUserZ,
} from "~/server/schema/zod-schema";
import { deleteFile } from "~/utils/cloudinary";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  verifyUser: protectedProcedure
    .input(updateUserZ)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      try {
        await ctx.db.user.update({
          where: { id: input.userId },
          data: { isVerified: true },
        });
        return {
          status: "success",
          message: "User verified successfully",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),

  updateProfile: protectedProcedure
    .input(updateProfileZ)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        include: {
          college: true,
          team: {
            include: {
              members: true,
            },
          },
        },
      });

      if (input.college !== user?.college?.id) {
        if (user?.team && user?.team?.members?.length > 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "All team members should belong to same college!",
          });
        }
      }

      //If ID is already there remove the existing one from cloudinary
      if (user?.aadhaar && input.aadhaarUrl !== user.aadhaar) {
        await deleteFile(user.aadhaar.split(";")[1]!);
      }
      if (user?.college_id && input.collegeIdUrl !== user.college_id) {
        await deleteFile(user.college_id.split(";")[1]!);
      }

      // upload files only if they exist otherwise set to existing url

      const hasNoChanges =
        user?.name === input.name &&
        user?.phone === input.phone &&
        input.aadhaarUrl === user?.aadhaar &&
        input.collegeIdUrl === user?.college_id &&
        user?.college?.id === input.college &&
        user?.tShirtSize === input.tshirtSize &&
        user?.course === input.course;

      const isComplete =
        input.name &&
        input.phone &&
        input.aadhaarUrl &&
        !input.aadhaarUrl?.startsWith("undefined") &&
        input.collegeIdUrl &&
        !input.collegeIdUrl?.startsWith("undefined") &&
        input.college &&
        input.tshirtSize &&
        input.course
          ? true
          : false;

      if (!isComplete) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Please fill all the required fields",
        });
      }

      if (hasNoChanges) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No changes made",
        });
      }

      await ctx.db.user.update({
        where: { id: ctx.session?.user.id },
        data: {
          profileProgress: isComplete ? "FORM_TEAM" : "FILL_DETAILS",
          name: input.name,
          phone: input.phone,
          aadhaar: input.aadhaarUrl,
          college_id: input.collegeIdUrl,
          college: { connect: { id: input.college } },
          course: input.course,
          tShirtSize: input.tshirtSize,
        },
      });

      return { status: "success", message: "Profile updated successfully" };
    }),

  editProfile: protectedProcedure
    .input(editProfileZ)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        include: {
          college: true,
          team: {
            include: {
              members: true,
            },
          },
        },
      });

      if (input.college !== user?.college?.id) {
        if (user?.team && user?.team?.members?.length > 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "All team members should belong to same college!",
          });
        }
      }

      //If ID is already there remove the existing one from cloudinary
      if (user?.aadhaar && input.aadhaarUrl !== user?.aadhaar) {
        await deleteFile(user.aadhaar.split(";")[1]!);
      }
      if (user?.college_id && input.collegeIdUrl !== user.college_id) {
        await deleteFile(user.college_id.split(";")[1]!);
      }

      // upload files only if they exist otherwise set to existing url
      const hasNoChanges =
        user?.name === input.name &&
        user?.phone === input.phone &&
        input.aadhaarUrl === user?.aadhaar &&
        input.collegeIdUrl === user?.college_id &&
        user?.college?.id === input.college &&
        user?.course === input.course;

      if (hasNoChanges) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No changes made",
        });
      }

      await ctx.db.user.update({
        where: { id: ctx.session?.user.id },
        data: {
          name: input.name,
          phone: input.phone,
          aadhaar: input.aadhaarUrl,
          college_id: input.collegeIdUrl,
          college: { connect: { id: input.college } },
          course: input.course,
        },
      });

      return { status: "success", message: "Profile updated successfully" };
    }),

  updateProfileProgress: protectedProcedure.mutation(async ({ ctx }) => {
    const user = ctx.session.user;
    try {
      if (user?.profileProgress !== "SUBMIT_IDEA")
        await ctx.db.team.update({
          data: {
            members: {
              updateMany: {
                where: {
                  teamId: user?.team?.id,
                },
                data: {
                  profileProgress: "SUBMIT_IDEA",
                },
              },
            },
          },
          where: {
            id: user?.team?.id,
          },
        });
      else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Already updated to SubmitIdea",
        });
      }

      return {
        status: "success",
        message: "Profile progress updated successfully",
      };
    } catch (error) {
      console.log(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }
  }),

  getUserWithCollege: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        college: true,
      },
    });
  }),

  getUserWithTeam: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        team: {
          include: {
            ideaSubmission: true,
          },
        },
        college: true,
      },
    });
  }),

  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.user.findMany({
        include: {
          college: true,
          team: {
            include: {
              ideaSubmission: true
            }
          }
        },
      });
    } catch (e) {
      console.log(e);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }
  }),
  markAttendance: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (
        ctx.session.user.role === "PARTICIPANT" ||
        ctx.session.user.role === "JUDGE" ||
        ctx.session.user.role === "VALIDATOR"
      )
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot perform this action",
        });
      try {
        const updatedUser = await ctx.db.user.update({
          where: { id: input.userId },
          data: {
            attended: true,
          },
          include: {
            college: true,
            team: {
              include: {
                members: true,
                ideaSubmission: true,
              },
            },
          },
        });

        const teamMembers = updatedUser.team?.members;
        if (teamMembers?.filter((member) => !member.attended).length === 0) {
          await ctx.db.team.update({
            where: { id: updatedUser.team?.id },
            data: {
              attended: true,
            },
          });
        }

        return {
          name: updatedUser.name,
          teamName: updatedUser.team?.name,
          collegeName: updatedUser.college?.name,
        };
      } catch (e) {
        console.log(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
});
