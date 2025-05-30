import { Courses, JudgeType, Tracks, TshirtSize } from "@prisma/client";
import { z } from "zod";

const updateUserZ = z.object({
  userId: z.string(),
});

const updateProfileZ = z.object({
  name: z
    .string()
    .min(1, { message: "Name cannot be empty" })
    .max(50, { message: "Name cannot exceed 50 characters" }),
  phone: z
    .string()
    .min(10, { message: "Phone number should be at least 10 characters long" })
    .max(10, { message: "Phone number should be at most 10 characters long" }),
  college: z
    .string({
      required_error: "College is required",
      invalid_type_error: "Something went wrong",
    })
    .min(1, { message: "College cannot be empty" }),
  tshirtSize: z.nativeEnum(TshirtSize, { message: "Select a Tshirt Size" }),
  course: z.nativeEnum(Courses, { message: "Select a Course" }),
  github: z
    .string()
    .min(1, { message: "Github usename cannot be empty" })
    .refine((val) => !val.includes("github.com/"), {
      message: "Enter only username",
    }),
  aadhaarUrl: z.string(),
  collegeIdUrl: z.string(),
});

const editProfileZ = z.object({
  name: z
    .string()
    .min(1, { message: "Name cannot be empty" })
    .min(5, { message: "Name should be at least 5 characters long" })
    .max(50, { message: "Name cannot exceed 50 characters" }),
  phone: z
    .string()
    .min(10, { message: "Phone number should be at least 10 characters long" })
    .max(10, { message: "Phone number should be at most 10 characters long" }),
  college: z
    .string({
      required_error: "College is required",
      invalid_type_error: "Something went wrong",
    })
    .min(1, { message: "College cannot be empty" }),
  course: z.custom<Courses>((val) => {
    return Object.values(Courses).includes(val as Courses);
  }),
  aadhaarUrl: z.string(),
  collegeIdUrl: z.string(),
});

const submitIdeaZ = z.object({
  problemStatement: z
    .string()
    .min(1, { message: "Problem statement cannot be empty" })
    .max(100, {
      message: "Problem statement cannot exceed 100 characters",
    }),
  track: z.nativeEnum(Tracks, {
    required_error: "Track is required",
  }),
  // referralCode: z.string().default(""),
  pptUrl: z.string(),
});

const createTeamZ = z.object({
  teamName: z
    .string()
    .min(1, { message: "Team name cannot be empty" })
    .max(30, { message: "Team name cannot exceed 10 characters" })
    .refine((value) => !value.startsWith(" ") && !value.endsWith(" "), {
      message: "Team name cannot start or end with a space",
    }),
});

const joinTeamZ = z.object({
  teamId: z.string().min(1, { message: "Team ID cannot be empty" }),
});

const createCollegeZ = z.object({
  name: z.string().min(1, { message: "Name cannot be empty" }),
  state: z
    .string({
      invalid_type_error: "Something went wrong",
    })
    .min(1, { message: "State cannot be empty" }),
});

const getTeamDetailsByIdZ = z.object({
  teamId: z.string().min(1, { message: "Team ID cannot be empty" }),
});

const addJudge = z.object({
  userId: z.string(),
  type: z.nativeEnum(JudgeType),
});

const finalSubmissionZ = z.object({
  paymentId: z.string().min(1, { message: "Payment ID cannot be empty" }),
  paymentProof: z.string(),
  teamId: z.string(),
});

const resumeSubmissionZ = z.object({
  userId: z.string(),
  resumeUrl: z.string(),
});

const appSettingsZ = z.object({
  isRegistrationOpen: z.boolean().optional(),
  isPaymentOpen: z.boolean().optional(),
  isVideoSubmissionOpen: z.boolean().optional(),
  isProfileEditOpen: z.boolean().optional(),
});

const paymentTransactionZ = z.object({
  transactionId: z
    .string()
    .min(3, { message: "Transaction ID cannot be empty" }),
  paymentProof: z.string().min(3, { message: "Payment proof required" }),
});

const createRoomZ = z
  .string()
  .min(3, { message: "Room name should be atleast 3 characters" })
  .max(15, { message: "Room name cannot exceed 15 characters" });

const joinRoomZ = z
  .string()
  .min(3, { message: "Room id should be atleast 3 characters" });

const roomInfoZ = z
  .string()
  .min(3, { message: "Room id should be atleast 3 characters" });

const chatMessageZ = z.object({
  content: z.string(),
  // isCode: z.boolean(),
  roomId: z.string()
})

export {
  editProfileZ,
  updateUserZ,
  updateProfileZ,
  submitIdeaZ,
  createTeamZ,
  joinTeamZ,
  createCollegeZ,
  getTeamDetailsByIdZ,
  addJudge,
  finalSubmissionZ,
  resumeSubmissionZ,
  appSettingsZ,
  paymentTransactionZ,
  createRoomZ,
  joinRoomZ,
  roomInfoZ,
  chatMessageZ
};
