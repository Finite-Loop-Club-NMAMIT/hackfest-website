import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Create Colleges
  const college1 = await prisma.college.create({
    data: {
      name: "College A",
      state: "KARNATAKA",
    },
  });

  const college2 = await prisma.college.create({
    data: {
      name: "College B",
      state: "MAHARASHTRA",
    },
  });

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      state: "KARNATAKA",
      collegeId: college1.id,
      isVerified: true,
      role: "PARTICIPANT",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "0987654321",
      state: "MAHARASHTRA",
      collegeId: college2.id,
      isVerified: true,
      role: "PARTICIPANT",
    },
  });

  // Create Teams
  const team1 = await prisma.team.create({
    data: {
      name: "Team Alpha",
      teamProgress: "NOT_SELECTED",
      Members: {
        connect: [{ id: user1.id }, { id: user2.id }],
      },
    },
  });

  // Create Idea Submissions
  const ideaSubmission1 = await prisma.ideaSubmission.create({
    data: {
      teamId: team1.id,
      track: "FINTECH",
      pptUrl: "http://example.com/ppt1",
    },
  });

  // Create Judges
  const judge1 = await prisma.judge.create({
    data: {
      userId: user1.id,
      type: "VALIDATOR",
    },
  });

  // Create Criteria
  const criteria1 = await prisma.criteria.create({
    data: {
      criteria: "Innovation",
      maxScore: 50,
    },
  });

  // Create Scores
  const score1 = await prisma.scores.create({
    data: {
      criteriaId: criteria1.id,
      judgeId: judge1.id,
      score: 80,
      teamId: team1.id,
    },
  });

  const appSetting = await prisma.appSettings.create({});

  console.log("Database seeded successfully with dummy data");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch((e) => {
      console.error(e);
      process.exit(1);
    });
  });
