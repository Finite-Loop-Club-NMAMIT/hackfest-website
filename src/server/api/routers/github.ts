import { TRPCClientError } from "@trpc/client";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Octokit } from "octokit";
import { env } from "~/env";
import { z } from "zod";
import { tName2GHRName, tName2GHTName } from "~/utils/github";

const ORGANIZATION_NAME = env.ORGANIZATION_NAME
const GITHUB_PERSONAL_ACCESS_TOKEN = env.GITHUB_PERSONAL_ACCESS_TOKEN

const octokit = new Octokit({ auth: GITHUB_PERSONAL_ACCESS_TOKEN });
const { data: { login } } = await octokit.rest.users.getAuthenticated();
console.log("Hello, %s", login);

export const githubRouter = createTRPCRouter({
  getAllGithubTeams: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.session.user.role !== "ADMIN"
        && ctx.session.user.role !== "ORGANISER") {
        throw new TRPCClientError("Unauthorized to get teams")
      }

      return await ctx.db.github.findMany({
        include: {
          team: {
            select: {
              name: true
            }
          }
        }
      })
    }),

  sendInvitation: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (ctx.session.user.role !== "ADMIN"
        && ctx.session.user.role !== "ORGANISER") {
        throw new TRPCClientError("Unauthorized to send invitation")
      }

      const teams = await ctx.db.team.findMany({
        where: {
          teamProgress: "SELECTED",
        },
        select: {
          id: true,
          name: true,
          members: {
            select: {
              github: true
            }
          }
        }
      })

      let count = 0;

      for (const team of teams) {
        const githubTeamName = tName2GHTName(team.name)
        const githubRepoName = tName2GHRName(team.name)

        try {
          const githubTeam = await octokit.rest.teams.create({
            org: ORGANIZATION_NAME,
            name: githubTeamName,
          });
          console.log(`Github team created : ${githubTeam.data.name}`)

          const { id: githubTeamId, slug: githubTeamSlug } = githubTeam.data

          const githubRepo = await octokit.request('POST /orgs/{org}/repos', {
            org: ORGANIZATION_NAME,
            name: githubRepoName,
            description: `Hackfest Repository - ${githubTeamName}`,
            private: true,
            team_id: githubTeamId,
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          })
          console.log(`Github repo created : ${githubRepo.data.name}`)

          const { id: githubRepoId } = githubRepo.data

          const githubInDB = await ctx.db.github.upsert({
            create: {
              githubRepoId: [githubRepoId],
              githubRepoName: [githubRepoName],
              githubTeamId: githubTeamId,
              githubTeamSlug: githubTeamSlug,
              team: {
                connect: {
                  id: team.id
                }
              }
            },
            update: {
              githubRepoId: {
                push: githubRepoId
              },
              githubRepoName: {
                push: githubRepoName
              },
              githubTeamId: githubTeamId,
              githubTeamSlug: githubTeamSlug,
            },
            where: {
              teamId: team.id
            }
          })
          console.log(githubInDB)

          for (const member of team.members) {
            const githubUsername = member.github
            if (!githubUsername)
              continue

            try {
              const githubUser = await octokit.request('GET /users/{username}', {
                username: githubUsername,
                headers: {
                  'X-GitHub-Api-Version': '2022-11-28'
                }
              })

              const invitation = await octokit.request("POST /orgs/{org}/invitations", {
                org: ORGANIZATION_NAME,
                invitee_id: githubUser.data.id,
                role: "direct_member",
                team_ids: [githubTeamId],
                headers: {
                  "X-GitHub-Api-Version": "2022-11-28",
                },
              });
              console.log(`Team invitation sent : ${invitation.data.email}`)
              count++;
            } catch { continue }
          }
        } catch { continue }
      }

      if (count === 0) {
        throw new TRPCClientError("No invitations sent")
      }
    }),

  sendInvitationToUser: protectedProcedure
    .input(z.object({
      teamId: z.string(),
      githubUsername: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.session.user.role !== "ADMIN"
        && ctx.session.user.role !== "ORGANISER") {
        throw new TRPCClientError("Unauthorized to send invitation")
      }

      const githubTeam = await ctx.db.github.findUnique({
        where: {
          teamId: input.teamId
        }
      })

      if (!githubTeam) {
        console.log(`Could not find team with id : ${input.teamId}`)
        throw new TRPCClientError("Could not find team")
      }

      const githubUser = await octokit.request('GET /users/{username}', {
        username: input.githubUsername,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })

      const invitation = await octokit.request("POST /orgs/{org}/invitations", {
        org: ORGANIZATION_NAME,
        invitee_id: githubUser.data.id,
        role: "direct_member",
        team_ids: [githubTeam.githubTeamId],
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
      console.log(`Team invitation sent : ${invitation.data.email}`)
    }),

  enableCommitForTeam: protectedProcedure
    .input(z.object({
      teamId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.session.user.role !== "ADMIN"
        && ctx.session.user.role !== "ORGANISER") {
        throw new TRPCClientError("Unauthorized to enable commits")
      }

      const githubTeam = await ctx.db.github.findUnique({
        where: {
          teamId: input.teamId
        },
        include: {
          team: {
            select: {
              name: true
            }
          }
        }
      })

      if (!githubTeam) {
        console.log(`Could not find team with id : ${input.teamId}`)
        throw new TRPCClientError("Could not find team")
      }

      for (const repoName of githubTeam.githubRepoName) {
        await octokit.request('PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}', {
          org: ORGANIZATION_NAME,
          team_slug: githubTeam.githubTeamSlug,
          owner: ORGANIZATION_NAME,
          repo: repoName,
          permission: 'maintain',
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        })
      }

      console.log(`Enabled commit for team : ${githubTeam.team.name} with team id : ${input.teamId}`)
    }),

  disableCommitForTeam: protectedProcedure
    .input(z.object({
      teamId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.session.user.role !== "ADMIN"
        && ctx.session.user.role !== "ORGANISER") {
        throw new TRPCClientError("Unauthorized to disable commits")
      }

      const githubTeam = await ctx.db.github.findUnique({
        where: {
          teamId: input.teamId
        },
        include: {
          team: {
            select: {
              name: true
            }
          }
        }
      })

      if (!githubTeam) {
        console.log(`Could not find team with id : ${input.teamId}`)
        throw new TRPCClientError("Could not find team")
      }

      for (const repoName of githubTeam.githubRepoName) {
        await octokit.request('PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}', {
          org: ORGANIZATION_NAME,
          team_slug: githubTeam.githubTeamSlug,
          owner: ORGANIZATION_NAME,
          repo: repoName,
          permission: 'pull',
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        })
      }

      console.log(`Disabled commit for team : ${githubTeam.team.name} with team id : ${input.teamId}`)
    }
    ),

  enableCommitForAll: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (ctx.session.user.role !== "ADMIN"
        && ctx.session.user.role !== "ORGANISER") {
        throw new TRPCClientError("Unauthorized to enable commits")
      }

      const githubTeams = await ctx.db.github.findMany({
        include: {
          team: {
            select: {
              name: true
            }
          }
        }
      })

      for (const githubTeam of githubTeams) {
        try{

          for (const repoName of githubTeam.githubRepoName) {
            await octokit.request ('PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}', {
            org: ORGANIZATION_NAME,
            team_slug: githubTeam.githubTeamSlug,
            owner: ORGANIZATION_NAME,
            repo: repoName,
            permission: 'maintain',
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          })
        }
      }
      catch{continue}

        console.log(`Enabled commit for team : ${githubTeam.team.name}`)
      }
    }),

  disableCommitForAll: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (ctx.session.user.role !== "ADMIN"
        && ctx.session.user.role !== "ORGANISER") {
        throw new TRPCClientError("Unauthorized to disable commits")
      }

      const githubTeams = await ctx.db.github.findMany({
        include: {
          team: {
            select: {
              name: true
            }
          }
        }
      })

      for (const githubTeam of githubTeams) {
        for (const repoName of githubTeam.githubRepoName) {
          await octokit.request('PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}', {
            org: ORGANIZATION_NAME,
            team_slug: githubTeam.githubTeamSlug,
            owner: ORGANIZATION_NAME,
            repo: repoName,
            permission: 'pull',
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          })
        }

        console.log(`Disabled commit for team : ${githubTeam.team.name}`)
      }
    }),

  makeRepoPrivateForTeam: protectedProcedure
    .input(z.object({
      teamId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.session.user.role !== "ADMIN"
        && ctx.session.user.role !== "ORGANISER") {
        throw new TRPCClientError("Unauthorized to make repo private")
      }

      const githubTeam = await ctx.db.github.findUnique({
        where: {
          teamId: input.teamId
        },
        include: {
          team: {
            select: {
              name: true
            }
          }
        }
      })

      if (!githubTeam) {
        console.log(`Could not find team with id : ${input.teamId}`)
        throw new TRPCClientError("Could not find team")
      }

      for (const repoName of githubTeam.githubRepoName) {
        await octokit.request('PATCH /repos/{owner}/{repo}', {
          owner: ORGANIZATION_NAME,
          repo: repoName,
          private: true,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        })
      }

      console.log(`Made repo private for team : ${githubTeam.team.name}`)
    }),

  makeRepoPublicForTeam: protectedProcedure
    .input(z.object({
      teamId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.session.user.role !== "ADMIN"
        && ctx.session.user.role !== "ORGANISER") {
        throw new TRPCClientError("Unauthorized to make repo public")
      }

      const githubTeam = await ctx.db.github.findUnique({
        where: {
          teamId: input.teamId
        },
        include: {
          team: {
            select: {
              name: true
            }
          }
        }
      })

      if (!githubTeam) {
        console.log(`Could not find team with id : ${input.teamId}`)
        throw new TRPCClientError("Could not find team")
      }

      for (const repoName of githubTeam.githubRepoName) {
        await octokit.request('PATCH /repos/{owner}/{repo}', {
          owner: ORGANIZATION_NAME,
          repo: repoName,
          private: false,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        })
      }

      console.log(`Made repo public for team : ${githubTeam.team.name}`)
    }),

  makeRepoPrivateForAll: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (ctx.session.user.role !== "ADMIN"
        && ctx.session.user.role !== "ORGANISER") {
        throw new TRPCClientError("Unauthorized to make repo private")
      }

      const githubTeams = await ctx.db.github.findMany({
        include: {
          team: {
            select: {
              name: true
            }
          }
        },
      })

      for (const githubTeam of githubTeams) {
        for (const repoName of githubTeam.githubRepoName) {
          await octokit.request('PATCH /repos/{owner}/{repo}', {
            owner: ORGANIZATION_NAME,
            repo: repoName,
            private: true,
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          })
        }

        console.log(`Made repo private for team : ${githubTeam.team.name}`)
      }
    }),

  makeRepoPublicForAll: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (ctx.session.user.role !== "ADMIN"
        && ctx.session.user.role !== "ORGANISER") {
        throw new TRPCClientError("Unauthorized to make repo public")
      }

      const githubTeams = await ctx.db.github.findMany({
        include: {
          team: {
            select: {
              name: true
            }
          }
        }
      })

      for (const githubTeam of githubTeams) {
        try {
          for (const repoName of githubTeam.githubRepoName) {
            await octokit.request('PATCH /repos/{owner}/{repo}', {
              owner: ORGANIZATION_NAME,
              repo: repoName,
              private: false,
              headers: {
                'X-GitHub-Api-Version': '2022-11-28'
              }
            })
          }
        } catch (error) {
          console.log(githubTeam.githubRepoName)
          continue
        }

        console.log(`Made repo public for team : ${githubTeam.team.name}`)
      }
    }),

  addRepoToTeam: protectedProcedure
    .input(z.object({
      teamId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.session.user.role !== "ADMIN"
        && ctx.session.user.role !== "ORGANISER") {
        throw new TRPCClientError("Unauthorized to make repo public")
      }

      const githubTeam = await ctx.db.github.findUnique({
        where: {
          teamId: input.teamId
        },
        include: {
          team: {
            select: {
              name: true
            }
          }
        }
      })

      if (!githubTeam) {
        console.log(`Could not find team with id : ${input.teamId}`)
        throw new TRPCClientError("Could not find team")
      }

      const githubRepoName = tName2GHRName(githubTeam.team.name, githubTeam.githubRepoId.length + 1)

      const githubRepo = await octokit.request('POST /orgs/{org}/repos', {
        org: ORGANIZATION_NAME,
        name: githubRepoName,
        description: `Hackfest Repository - ${githubTeam.team.name}`,
        private: true,
        team_id: githubTeam.githubTeamId,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })
      console.log(`Github repo created : ${githubRepo.data.name}`)

      const { id: githubRepoId } = githubRepo.data

      const githubInDB = await ctx.db.github.update({
        where: {
          id: githubTeam.id
        },
        data: {
          githubRepoId: {
            push: githubRepoId
          },
          githubRepoName: {
            push: githubRepoName
          }
        }
      })
      console.log(githubInDB)
    }),

  getNumberOfRepos: protectedProcedure
    .input(z.object({
      teamId: z.string()
    }))
    .query(async ({ input, ctx }) => {
      if (ctx.session.user.role !== "ADMIN"
        && ctx.session.user.role !== "ORGANISER") {
        throw new TRPCClientError("Unauthorized to get number of repos")
      }

      const githubTeams = await ctx.db.github.findUnique({
        where: {
          teamId: input.teamId
        },
        select: {
          githubRepoId: true
        }
      })

      if (!githubTeams) {
        console.log(`Could not find team with id : ${input.teamId}`)
        throw new TRPCClientError("Could not find team")
      }

      return githubTeams.githubRepoId.length
    })
});
