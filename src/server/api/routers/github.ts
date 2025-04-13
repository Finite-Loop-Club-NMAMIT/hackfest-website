import { TRPCClientError } from "@trpc/client";
import { adminProcedure, createTRPCRouter } from "../trpc";
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
  getAllGithubTeams: adminProcedure
    .query(async ({ ctx }) => {
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

  sendInvitation: adminProcedure
    .mutation(async ({ ctx }) => {
      const teams = await ctx.db.team.findMany({
        where: {
          teamProgress: "SELECTED",
        },
        select: {
          id: true,
          name: true,
          Members: {
            select: {
              github: true
            }
          }
        }
      })

      let count = 0;
      let invitedCount = 0;
      const failedTeams: string[] = [];

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

          for (const member of team.Members) {
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
              if (invitation.data.email) { // Check if invitation was successful
                invitedCount++;
              }
              count++;
            } catch { continue }
          }
        } catch (e) {
          console.error(`Failed processing team ${team.name} (ID: ${team.id}):`, e);
          failedTeams.push(team.name);
          continue
        }
      }

      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "GITHUB_INVITE_BATCH",
          description: `Admin ${ctx.session.user.email} attempted batch GitHub invitations. Successful invites: ${invitedCount}. Failed teams: ${failedTeams.join(', ') || 'None'}.`,
        },
      });

      if (count === 0 && teams.length > 0) { // Adjusted error condition
        throw new TRPCClientError("No invitations sent successfully.")
      }
    }),

  sendInvitationToUser: adminProcedure
    .input(z.object({
      teamId: z.string(),
      githubUsername: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
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

      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "GITHUB_INVITE_USER",
          description: `Admin ${ctx.session.user.email} sent GitHub invitation to ${input.githubUsername} for team ${input.teamId}. Invite Email: ${invitation.data.email ?? 'N/A'}`,
        },
      });
    }),

  enableCommitForTeam: adminProcedure
    .input(z.object({
      teamId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
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

      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "GITHUB_PERM_ENABLE",
          description: `Admin ${ctx.session.user.email} enabled 'maintain' permissions for team ${githubTeam.team.name} (ID: ${input.teamId}) on repos: ${githubTeam.githubRepoName.join(', ')}.`,
        },
      });

      console.log(`Enabled commit for team : ${githubTeam.team.name} with team id : ${input.teamId}`)
    }),

  disableCommitForTeam: adminProcedure
    .input(z.object({
      teamId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
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

      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "GITHUB_PERM_DISABLE",
          description: `Admin ${ctx.session.user.email} disabled 'maintain' (set to 'pull') permissions for team ${githubTeam.team.name} (ID: ${input.teamId}) on repos: ${githubTeam.githubRepoName.join(', ')}.`,
        },
      });

      console.log(`Disabled commit for team : ${githubTeam.team.name} with team id : ${input.teamId}`)
    }
    ),

  enableCommitForAll: adminProcedure
    .mutation(async ({ ctx }) => {
      const githubTeams = await ctx.db.github.findMany({
        include: {
          team: {
            select: {
              name: true
            }
          }
        }
      })

      let successCount = 0;
      const failedTeams: string[] = [];

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
        successCount++;
        console.log(`Enabled commit for team : ${githubTeam.team.name}`)
      }
      catch(e){
        console.error(`Failed enabling commit for team ${githubTeam.team.name}:`, e);
        failedTeams.push(githubTeam.team.name);
        continue
      }
      }
       await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "GITHUB_PERM_ENABLE_ALL",
          description: `Admin ${ctx.session.user.email} attempted to enable 'maintain' permissions for all teams. Success: ${successCount}. Failed: ${failedTeams.join(', ') || 'None'}.`,
        },
      });
    }),

  disableCommitForAll: adminProcedure
    .mutation(async ({ ctx }) => {
      const githubTeams = await ctx.db.github.findMany({
        include: {
          team: {
            select: {
              name: true
            }
          }
        }
      })

      let successCount = 0;
      const failedTeams: string[] = [];

      for (const githubTeam of githubTeams) {
         try{
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
            successCount++;
            console.log(`Disabled commit for team : ${githubTeam.team.name}`)
         } catch(e) {
            console.error(`Failed disabling commit for team ${githubTeam.team.name}:`, e);
            failedTeams.push(githubTeam.team.name);
            continue;
         }
      }
       await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "GITHUB_PERM_DISABLE_ALL",
          description: `Admin ${ctx.session.user.email} attempted to disable 'maintain' (set to 'pull') permissions for all teams. Success: ${successCount}. Failed: ${failedTeams.join(', ') || 'None'}.`,
        },
      });
    }),

  makeRepoPrivateForTeam: adminProcedure
    .input(z.object({
      teamId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
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

      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "GITHUB_VISIBILITY_PRIVATE",
          description: `Admin ${ctx.session.user.email} set repo visibility to private for team ${githubTeam.team.name} (ID: ${input.teamId}) on repos: ${githubTeam.githubRepoName.join(', ')}.`,
        },
      });

      console.log(`Made repo private for team : ${githubTeam.team.name}`)
    }),

  makeRepoPublicForTeam: adminProcedure
    .input(z.object({
      teamId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
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

      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "GITHUB_VISIBILITY_PUBLIC",
          description: `Admin ${ctx.session.user.email} set repo visibility to public for team ${githubTeam.team.name} (ID: ${input.teamId}) on repos: ${githubTeam.githubRepoName.join(', ')}.`,
        },
      });

      console.log(`Made repo public for team : ${githubTeam.team.name}`)
    }),

  makeRepoPrivateForAll: adminProcedure
    .mutation(async ({ ctx }) => {
      const githubTeams = await ctx.db.github.findMany({
        include: {
          team: {
            select: {
              name: true
            }
          }
        },
      })

      let successCount = 0;
      const failedTeams: string[] = [];

      for (const githubTeam of githubTeams) {
        try {
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
          successCount++;
          console.log(`Made repo private for team : ${githubTeam.team.name}`)
        } catch (e) {
           console.error(`Failed setting repo private for team ${githubTeam.team.name}:`, e);
           failedTeams.push(githubTeam.team.name);
           continue;
        }
      }
       await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "GITHUB_VISIBILITY_PRIVATE_ALL",
          description: `Admin ${ctx.session.user.email} attempted to set repo visibility to private for all teams. Success: ${successCount}. Failed: ${failedTeams.join(', ') || 'None'}.`,
        },
      });
    }),

  makeRepoPublicForAll: adminProcedure
    .mutation(async ({ ctx }) => {
      const githubTeams = await ctx.db.github.findMany({
        include: {
          team: {
            select: {
              name: true
            }
          }
        }
      })

      let successCount = 0;
      const failedTeams: string[] = [];

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
          successCount++;
          console.log(`Made repo public for team : ${githubTeam.team.name}`)
        } catch (error) {
          console.log(githubTeam.githubRepoName)
          failedTeams.push(githubTeam.team.name); // Log failed team name
          continue
        }
      }
       await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "GITHUB_VISIBILITY_PUBLIC_ALL",
          description: `Admin ${ctx.session.user.email} attempted to set repo visibility to public for all teams. Success: ${successCount}. Failed: ${failedTeams.join(', ') || 'None'}.`,
        },
      });
    }),

  addRepoToTeam: adminProcedure
    .input(z.object({
      teamId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
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

      await ctx.db.auditLog.create({
        data: {
          sessionUser: ctx.session.user.email,
          auditType: "GITHUB_REPO_ADD",
          description: `Admin ${ctx.session.user.email} added new repo '${githubRepoName}' (ID: ${githubRepoId}) to team ${githubTeam.team.name} (ID: ${input.teamId}).`,
        },
      });

      console.log(githubInDB)
    }),

  getNumberOfRepos: adminProcedure
    .input(z.object({
      teamId: z.string()
    }))
    .query(async ({ input, ctx }) => {
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
