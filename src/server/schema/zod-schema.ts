import { Category, Courses, JudgeType, Tracks, TshirtSize } from "@prisma/client";
import { X } from "lucide-react";
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
  tshirtSize: z.custom<TshirtSize>((val) => {
    return Object.values(TshirtSize).includes(val as TshirtSize);
  }),
  course: z.custom<Courses>((val) => {
    return Object.values(Courses).includes(val as Courses);
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
  referralCode: z.string().default(""),
  pptUrl: z.string(),
});

const createTeamZ = z.object({
  teamName: z
    .string()
    .min(1, { message: "Team name cannot be empty" })
    .max(10, { message: "Team name cannot exceed 10 characters" })
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

const addFaqZ = z.object({
  question: z
    .string()
    .min(1, { message: "Question cannot be empty" })
    .max(100, { message: "Question cannot exceed 100 characters" }),
  category: z.nativeEnum(Category, {
    required_error: "Category is required",
  }),
});

const answerFaqZ = z.object({
  id: z.number(),
  answer: z
    .string()
    .min(1, { message: "Answer cannot be empty" })
    .max(100, { message: "Answer cannot exceed 100 characters" }),
});

const deleteFaqZ = z.object({
  id: z.number(),
});

const addReferralCodeZ = z.object({
  code: z
  .string(),
  referrer: z
    .string()
    .min(1, { message: "Referrer cannot be empty" })
    .max(50, { message: "Referrer cannot exceed 50 characters" }),
  collegeId: z
    .string(
      {
        required_error: "College ID is required",
        invalid_type_error: "Something went wrong",
      }
    )
    .min(1, { message: "College ID cannot be empty" }),
  name: z
      .string()
      .min(1, { message: "Name cannot be empty" })
      .max(50, { message: "Name cannot exceed 50 characters" }),
  contact: z
      .string()
      .min(10, { message: "Enter valid email or phone number" })
      .max(10, { message: "Enter valid email or phone number" })
      .or(z.string().email({message: "Enter valid email or phone number"})),
})

const addJudgeZ = z.object({
  userId: z.string(),
  type: z.nativeEnum(JudgeType),
  track: z.enum(['FINTECH',
  'SUSTAINABLE_DEVELOPMENT',
  'HEALTHCARE',
  'METAVERSE',
  'LOGISTICS',
  'OPEN_INNOVATION',
  'ALL'])
})


const finalSubmissionZ = z.object({
  paymentId: z.string().min(1,{message:'Payment ID cannot be empty'}),
  paymentProof: z.string(),
  teamId: z.string(),
})

const resumeSubmissionZ = z.object({
  userId: z.string(),
  resumeUrl: z.string()
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
  addFaqZ,
  answerFaqZ,
  deleteFaqZ,
  addReferralCodeZ,
  addJudgeZ,
  finalSubmissionZ,
  resumeSubmissionZ
};
