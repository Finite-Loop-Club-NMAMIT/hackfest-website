import { userRouter } from "~/server/api/routers/user";
import { createTRPCRouter } from "~/server/api/trpc";
import { teamRouter } from "./routers/team";
import { collegeRouter } from "./routers/college";
import { validatorRouter } from "./routers/validator";
import { organiserRouter } from "./routers/organiser";
import { superValidatorRouter } from "./routers/super-validator";
import { githubRouter } from "./routers/github";
import { JudgeRouter } from "./routers/judges";
import { videoRouter } from "./routers/videoSubmission";
import { appSettingsRouter } from "./routers/app";
import { remarkRouter } from "./routers/remark";
import { ideaRouter } from "./routers/idea";
import { analyticsRouter } from "./routers/analytics";
import { auditLog } from "./routers/auditlog";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  team: teamRouter,
  college: collegeRouter,
  validator: validatorRouter,
  organiser: organiserRouter,
  superValidator: superValidatorRouter,
  github: githubRouter,
  judges: JudgeRouter,
  video: videoRouter,
  analytics: analyticsRouter ,
  audit: auditLog,
  appSettings: appSettingsRouter,
  remark: remarkRouter,
  idea: ideaRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
