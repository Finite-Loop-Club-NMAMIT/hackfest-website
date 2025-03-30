import { adminProcedure, createTRPCRouter } from "../trpc";

export const downloadData = createTRPCRouter({
  downloadConfirmedData: adminProcedure.query(async ({ ctx }) => {
    const teams = await ctx.db.team.findMany({
      where: {
        isComplete: true,
      },
      select: {
        id: true,
        name: true,
        Members: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
    if (teams.length === 0) return { csv: "" };

    // Compute max number of members per team
    const maxMembers = teams.reduce(
      (max, team) => Math.max(max, team.Members.length),
      0,
    );
    // Build header row
    const header = ["id", "name"];
    for (let i = 0; i < maxMembers; i++) {
      header.push(
        `member${i + 1}_name`,
        `member${i + 1}_email`,
        `member${i + 1}_phone`,
      );
    }
    // Build data rows
    const rows = teams.map((team) => {
      const row = [team.id, team.name];
      for (let i = 0; i < maxMembers; i++) {
        if (i < team.Members.length) {
          const member = team.Members[i]!;
          row.push(member.name ?? "", member.email ?? "", member.phone ?? "");
        } else {
          row.push("", "", "");
        }
      }
      return row.join(",");
    });
    const csv = [header.join(","), ...rows].join("\n");
    const base64Csv = Buffer.from(csv).toString("base64");
    return { csv: base64Csv };
  }),
  downloadNotConfirmedData: adminProcedure.query(async ({ ctx }) => {
    const teams = await ctx.db.team.findMany({
      where: {
        isComplete: false,
      },
      select: {
        id: true,
        name: true,
        Members: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
    if (teams.length === 0) return { csv: "" };

    // Compute max number of members per team
    const maxMembers = teams.reduce(
      (max, team) => Math.max(max, team.Members.length),
      0,
    );
    // Build header row
    const header = ["id", "name"];
    for (let i = 0; i < maxMembers; i++) {
      header.push(
        `member${i + 1}_name`,
        `member${i + 1}_email`,
        `member${i + 1}_phone`,
      );
    }
    // Build data rows
    const rows = teams.map((team) => {
      const row = [team.id, team.name];
      for (let i = 0; i < maxMembers; i++) {
        if (i < team.Members.length) {
          const member = team.Members[i]!;
          row.push(member.name ?? "", member.email ?? "", member.phone ?? "");
        } else {
          row.push("", "", "");
        }
      }
      return row.join(",");
    });
    const csv = [header.join(","), ...rows].join("\n");
    const base64Csv = Buffer.from(csv).toString("base64");
    return { csv: base64Csv };
  }),
  downloadNoTeamData: adminProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({
      where: {
        teamId: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });
    if (users.length === 0) return { csv: "" };

    const header = ["id", "name", "email", "phone"];
    const rows = users.map((user) =>
      [user.id, user.name, user.email, user.phone].join(","),
    );
    const csv = [header.join(","), ...rows].join("\n");
    const base64Csv = Buffer.from(csv).toString("base64");
    return { csv: base64Csv };
  }),
  downloadPaymentStatus: adminProcedure.query(async ({ ctx }) => {
    const teams = await ctx.db.team.findMany({
      where: {
        Members: {
          some: { isLeader: true },
        },
        teamProgress: "SELECTED",
      },
      select: {
        id: true,
        paymentStatus: true,
        Members: {
          where: { isLeader: true },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
    if (teams.length === 0) return { csv: "" };

    const header = [
      "teamId",
      "teamLeader_id",
      "teamLeader_name",
      "teamLeader_email",
      "teamLeader_phone",
      "paymentStatus",
    ];
    const rows = teams.map((team) => {
      const leader = team.Members[0] ?? {
        id: "",
        name: "",
        email: "",
        phone: "",
      };
      return [
        team.id,
        leader.id,
        leader.name,
        leader.email,
        leader.phone,
        team.paymentStatus ?? "",
      ].join(",");
    });
    const csv = [header.join(","), ...rows].join("\n");
    const base64Csv = Buffer.from(csv).toString("base64");
    return { csv: base64Csv };
  }),
});
