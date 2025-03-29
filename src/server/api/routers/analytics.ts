import { adminProcedure, createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { db } from "~/server/db";
import type { webAnalytics } from "@prisma/client";

// Define types for our analytics processing
interface RouteData {
  visits: number;
  uniqueUsers: Set<string>;
  totalTime: number;
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}

// Enhanced interfaces to separate logged-in and anonymous users
interface RouteAnalytics {
  visits: number;
  uniqueLoggedInUsers: number;
  totalTime: number;
  avgTimePerVisit: number;
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  loggedIn: {
    visits: number;
    uniqueUsers: number;
    totalTime: number;
    avgTimePerVisit: number;
    devices: {
      desktop: number;
      mobile: number;
      tablet: number;
    };
  };
  anonymous: {
    visits: number;
    totalTime: number;
    avgTimePerVisit: number;
    devices: {
      desktop: number;
      mobile: number;
      tablet: number;
    };
  };
  retention: {
    rate: number;
    returningUsers: number;
    totalUsers: number;
  };
  bounce: {
    rate: number;
    bouncedSessions: number;
    totalSessions: number;
  };
}

interface AnalyticsResponse {
  globalMetrics: {
    totalVisits: number;
    uniqueLoggedInUsers: number;
    totalTimeSpent: number;
    avgTimePerVisit: number;
    loggedIn: {
      visits: number;
      uniqueUsers: number;
      totalTime: number;
      avgTimePerVisit: number;
    };
    anonymous: {
      visits: number;
      totalTime: number;
      avgTimePerVisit: number;
    };
    retention: {
      overall: number;
      loggedIn: {
        rate: number;
        returningUsers: number;
        totalUsers: number;
      };
    };
    bounce: {
      overall: number;
      loggedIn: {
        rate: number;
        bouncedSessions: number;
        totalSessions: number;
      };
      anonymous: {
        rate: number;
        bouncedSessions: number;
        totalSessions: number;
      };
    };
  };
  routeAnalytics: Record<string, RouteAnalytics>;
}

export const analyticsRouter = createTRPCRouter({
  logVisit: publicProcedure
    .input(
      z.object({
        session_user: z.string().nullable(),
        uniqueId: z.string(),
        routePath: z.string(),
        device: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { session_user, uniqueId, routePath, device } = input;
      const currentDateAndTime = new Date();
      await db.webAnalytics.create({
        data: {
          sessionUser: session_user,
          uniqueId: uniqueId,
          routePath: routePath,
          isChecked: "no",
          device: device,
          timer: 0,
          startPing: currentDateAndTime,
          lastPing: currentDateAndTime,
        },
      });
    }),

  // Update an existing visit
  updateVisit: publicProcedure
    .input(
      z.object({
        uniqueId: z.string(),
        timer: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const { uniqueId, timer } = input;
      const currentDateAndTime = new Date();
      await db.webAnalytics.updateMany({
        where: { uniqueId },
        data: {
          timer,
          isChecked: "yes",
          lastPing: currentDateAndTime,
        },
      });
    }),

  // Retrieve analytics data
  getAnalytics: adminProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.webAnalytics.findMany();
    return data;
  }),

  // Procedure to update entries with null timer values
  updateNullEntries: publicProcedure
    .input(
      z.object({
        session_user: z.string().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const { session_user } = input;
      await db.webAnalytics.updateMany({
        where: {
          sessionUser: session_user,
          isChecked: "no",
        },
        data: {
          isChecked: "yes",
        },
      });
    }),

  syncTimerVisit: publicProcedure
    .input(
      z.object({
        uniqueId: z.string(),
        timer: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const { uniqueId, timer } = input;
      const currentDateAndTime = new Date();
      await db.webAnalytics.updateMany({
        where: { uniqueId },
        data: {
          timer,
          lastPing: currentDateAndTime,
        },
      });
    }),

  getDeepAnalytics: adminProcedure.query(async (): Promise<AnalyticsResponse> => {
    const analyticsData = await db.webAnalytics.findMany();

    // Create a robust type guard for sessionUser
    const isValidSessionUser = (user: string | null | undefined): user is string => {
      return typeof user === 'string' && user.trim().length > 0;
    };

    // Separate data for logged-in and anonymous users
    const loggedInSessions = analyticsData.filter((entry) => isValidSessionUser(entry.sessionUser));
    const anonymousSessions = analyticsData.filter((entry) => !isValidSessionUser(entry.sessionUser));

    // Global metrics
    const totalVisits = analyticsData.length;
    const loggedInVisits = loggedInSessions.length;
    const anonymousVisits = anonymousSessions.length;

    // Unique logged-in users
    const uniqueLoggedInUsers = new Set<string>();
    loggedInSessions.forEach((entry) => {
      if (isValidSessionUser(entry.sessionUser)) {
        uniqueLoggedInUsers.add(entry.sessionUser);
      }
    });

    // Calculate time metrics
    const totalTimeSpent = analyticsData.reduce((sum, entry) => sum + (entry.timer ?? 0), 0);
    const loggedInTimeSpent = loggedInSessions.reduce((sum, entry) => sum + (entry.timer ?? 0), 0);
    const anonymousTimeSpent = anonymousSessions.reduce((sum, entry) => sum + (entry.timer ?? 0), 0);

    // Average time per visit
    const avgTimePerVisit = totalVisits > 0 ? totalTimeSpent / totalVisits : 0;
    const loggedInAvgTime = loggedInVisits > 0 ? loggedInTimeSpent / loggedInVisits : 0;
    const anonymousAvgTime = anonymousVisits > 0 ? anonymousTimeSpent / anonymousVisits : 0;

    // Calculate retention rate (for logged-in users)
    const userVisitMap = new Map<string, Set<string>>();
    loggedInSessions.forEach((entry) => {
      if (isValidSessionUser(entry.sessionUser)) {
        if (!userVisitMap.has(entry.sessionUser)) {
          userVisitMap.set(entry.sessionUser, new Set<string>());
        }
        const userDates = userVisitMap.get(entry.sessionUser);
        if (userDates) {
          userDates.add(entry.startPing?.toISOString().split('T')[0] ?? "unknown");
        }
      }
    });

    const returningUsers = Array.from(userVisitMap.values()).filter(dates => dates.size > 1).length;
    const totalUniqueUsers = userVisitMap.size;
    const retentionRate = totalUniqueUsers > 0 ? (returningUsers / totalUniqueUsers) * 100 : 0;

    // Calculate bounce rate
    const BOUNCE_TIME_THRESHOLD = 30; // 30 seconds threshold

    // Group sessions by uniqueId to identify single-page visits
    const sessionGroups = new Map<string, webAnalytics[]>();
    analyticsData.forEach((entry) => {
      if (!sessionGroups.has(entry.uniqueId)) {
        sessionGroups.set(entry.uniqueId, []);
      }
      sessionGroups.get(entry.uniqueId)?.push(entry);
    });

    // Calculate bounce metrics for logged-in and anonymous sessions separately
    const loggedInBounces = {
      bouncedSessions: 0,
      totalSessions: 0,
    };
    const anonymousBounces = {
      bouncedSessions: 0,
      totalSessions: 0,
    };

    sessionGroups.forEach((sessions) => {
      const isLoggedIn = isValidSessionUser(sessions[0]?.sessionUser);
      const isBounce = sessions.length === 1 && (sessions[0]?.timer ?? 0) < BOUNCE_TIME_THRESHOLD;

      if (isLoggedIn) {
        loggedInBounces.totalSessions++;
        if (isBounce) loggedInBounces.bouncedSessions++;
      } else {
        anonymousBounces.totalSessions++;
        if (isBounce) anonymousBounces.bouncedSessions++;
      }
    });

    const loggedInBounceRate = loggedInBounces.totalSessions > 0
      ? (loggedInBounces.bouncedSessions / loggedInBounces.totalSessions) * 100
      : 0;
    const anonymousBounceRate = anonymousBounces.totalSessions > 0
      ? (anonymousBounces.bouncedSessions / anonymousBounces.totalSessions) * 100
      : 0;
    const overallBounceRate = (loggedInBounces.bouncedSessions + anonymousBounces.bouncedSessions) /
      (loggedInBounces.totalSessions + anonymousBounces.totalSessions) * 100;

    // Route-level analytics
    const routeMap = new Map<string, {
      all: RouteData;
      loggedIn: RouteData;
      anonymous: RouteData;
      userVisits: Map<string, Set<string>>; // Track unique dates per user per route
      sessions: Map<string, webAnalytics[]>; // Track sessions per route
    }>();

    // Process each analytics entry
    analyticsData.forEach((entry: webAnalytics) => {
      const route = entry.routePath;
      const time = entry.timer ?? 0;
      const sessionUser = entry.sessionUser;
      const isLoggedIn = isValidSessionUser(sessionUser);
      const device = entry.device;

      // If route doesn't exist in map, initialize it
      if (!routeMap.has(route)) {
        routeMap.set(route, {
          all: {
            visits: 0,
            uniqueUsers: new Set<string>(),
            totalTime: 0,
            devices: { desktop: 0, mobile: 0, tablet: 0 },
          },
          loggedIn: {
            visits: 0,
            uniqueUsers: new Set<string>(),
            totalTime: 0,
            devices: { desktop: 0, mobile: 0, tablet: 0 },
          },
          anonymous: {
            visits: 0,
            uniqueUsers: new Set<string>(), // Not meaningful, but kept for consistency
            totalTime: 0,
            devices: { desktop: 0, mobile: 0, tablet: 0 },
          },
          userVisits: new Map(),
          sessions: new Map()
        });
      }

      const routeData = routeMap.get(route)!;

      // Update metrics for all users
      routeData.all.visits++;
      routeData.all.totalTime += time;
      if (isLoggedIn) {
        routeData.all.uniqueUsers.add(sessionUser);
      }

      // Update device counts for all users
      if (device === "desktop") routeData.all.devices.desktop++;
      else if (device === "mobile") routeData.all.devices.mobile++;
      else if (device === "tablet") routeData.all.devices.tablet++;

      // Update metrics based on user type (logged-in or anonymous)
      if (isLoggedIn) {
        routeData.loggedIn.visits++;
        routeData.loggedIn.totalTime += time;
        routeData.loggedIn.uniqueUsers.add(sessionUser);

        // Update device counts for logged-in users
        if (device === "desktop") routeData.loggedIn.devices.desktop++;
        else if (device === "mobile") routeData.loggedIn.devices.mobile++;
        else if (device === "tablet") routeData.loggedIn.devices.tablet++;

        // Update route-specific user visits
        if (!routeData.userVisits.has(sessionUser)) {
          routeData.userVisits.set(sessionUser, new Set());
        }
        const userDates = routeData.userVisits.get(sessionUser);
        if (userDates) {
          userDates.add(entry.startPing?.toISOString().split('T')[0] ?? "unknown");
        }
      } else {
        routeData.anonymous.visits++;
        routeData.anonymous.totalTime += time;

        // Update device counts for anonymous users
        if (device === "desktop") routeData.anonymous.devices.desktop++;
        else if (device === "mobile") routeData.anonymous.devices.mobile++;
        else if (device === "tablet") routeData.anonymous.devices.tablet++;
      }

      // Track sessions for bounce rate calculation
      if (!routeData.sessions.has(entry.uniqueId)) {
        routeData.sessions.set(entry.uniqueId, []);
      }
      routeData.sessions.get(entry.uniqueId)?.push(entry);
    });

    // Process the map into a returnable object
    const routeAnalytics: Record<string, RouteAnalytics> = {};

    routeMap.forEach((data, route) => {
      // Calculate route-specific retention rate
      const routeUsers = data.userVisits;
      const returningUsers = Array.from(routeUsers.values()).filter(dates => dates.size > 1).length;
      const totalUsers = routeUsers.size;
      const retentionRate = totalUsers > 0 ? (returningUsers / totalUsers) * 100 : 0;

      // Calculate route-specific bounce rate
      const BOUNCE_TIME_THRESHOLD = 30;
      let bouncedSessions = 0;
      let totalSessions = 0;

      data.sessions.forEach((sessions) => {
        const isRouteOnly = sessions.every(s => s.routePath === route);
        const isBounce = isRouteOnly && 
          sessions.length === 1 && 
          (sessions[0]?.timer ?? 0) < BOUNCE_TIME_THRESHOLD;

        totalSessions++;
        if (isBounce) bouncedSessions++;
      });

      const bounceRate = totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;

      routeAnalytics[route] = {
        visits: data.all.visits,
        uniqueLoggedInUsers: data.all.uniqueUsers.size,
        totalTime: data.all.totalTime,
        avgTimePerVisit: data.all.visits > 0 ? data.all.totalTime / data.all.visits : 0,
        devices: data.all.devices,

        // Logged-in users metrics
        loggedIn: {
          visits: data.loggedIn.visits,
          uniqueUsers: data.loggedIn.uniqueUsers.size,
          totalTime: data.loggedIn.totalTime,
          avgTimePerVisit: data.loggedIn.visits > 0 ? data.loggedIn.totalTime / data.loggedIn.visits : 0,
          devices: data.loggedIn.devices,
        },

        // Anonymous users metrics
        anonymous: {
          visits: data.anonymous.visits,
          totalTime: data.anonymous.totalTime,
          avgTimePerVisit: data.anonymous.visits > 0 ? data.anonymous.totalTime / data.anonymous.visits : 0,
          devices: data.anonymous.devices,
        },

        retention: {
          rate: retentionRate,
          returningUsers,
          totalUsers
        },
        bounce: {
          rate: bounceRate,
          bouncedSessions,
          totalSessions
        }
      };
    });

    // Return comprehensive analysis with separate logged-in and anonymous data
    return {
      globalMetrics: {
        totalVisits,
        uniqueLoggedInUsers: uniqueLoggedInUsers.size,
        totalTimeSpent,
        avgTimePerVisit,
        loggedIn: {
          visits: loggedInVisits,
          uniqueUsers: uniqueLoggedInUsers.size,
          totalTime: loggedInTimeSpent,
          avgTimePerVisit: loggedInAvgTime,
        },
        anonymous: {
          visits: anonymousVisits,
          totalTime: anonymousTimeSpent,
          avgTimePerVisit: anonymousAvgTime,
        },
        retention: {
          overall: retentionRate,
          loggedIn: {
            rate: retentionRate,
            returningUsers,
            totalUsers: totalUniqueUsers
          }
        },
        bounce: {
          overall: overallBounceRate,
          loggedIn: {
            rate: loggedInBounceRate,
            ...loggedInBounces
          },
          anonymous: {
            rate: anonymousBounceRate,
            ...anonymousBounces
          }
        }
      },
      routeAnalytics,
    };
  }),
});
