import RegisterProfile from "~/components/forms/registerProfile";
import TeamDetails from "~/components/forms/teamInfo";
import Progress from "~/components/registrationProgress";
import IdeaSubmitForm from "~/components/forms/ideaSubmitForm";
import FormButtons from "~/components/formButtons";
import NotLoggedIn from "~/components/notLoggedIn";
import Registered from "~/components/registered";
import { Button } from "~/components/ui/button";
import { LogoutButton } from "~/components/profile/logout";
import { FaDiscord } from "react-icons/fa";
import { BookOpen, Loader2Icon } from "lucide-react";
import CreateTeam from "~/components/forms/createTeam";
import ProgressProvider from "~/components/progressProvider";
import { api } from "~/utils/api";
import RootLayout from "~/components/layout";
import { Card } from "~/components/ui/card";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  // const {
  //   data: user,
  //   refetch,
  //   isLoading,
  // } = api.user.getUserWithTeam.useQuery();

  // let currentStep = 0;

  // if (isLoading)
  //   return (
  //     <RootLayout>
  //       <div
  //         className={`flex min-h-screen max-w-screen-2xl items-center justify-center  bg-[url("/images/blue-grainy.png")] bg-cover bg-center px-5 md:px-10 lg:px-28`}
  //       >
  //         <Card className="flex h-96 w-full items-center justify-center gap-2">
  //           Loading...
  //           <Loader2Icon className="animate-spin" />
  //         </Card>
  //       </div>
  //     </RootLayout>
  //   );

  // if (!user) {
  //   return <NotLoggedIn />;
  // } else if (user.profileProgress === "FILL_DETAILS") {
  //   currentStep = 0;
  // } else if (user.profileProgress === "FORM_TEAM") {
  //   currentStep = 1;
  // } else if (user.profileProgress === "SUBMIT_IDEA") {
  //   if (user.team?.ideaSubmission) {
  //     currentStep = 3;
  //   } else {
  //     currentStep = 2;
  //   }
  // } else if (user.profileProgress === "COMPLETE") {
  //   currentStep = 3;
  // }

  return (
    // <RootLayout>
    //   <main
    //     className={`relative overflow-hidden bg-[url("/images/blue-grainy.png")] bg-cover bg-center`}
    //   >
    //      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center bg-black/20"></div>

    //     <div className="mx-5 flex min-h-screen max-w-screen-2xl items-center justify-center md:mx-20 lg:mx-48">
    //       <div className="z-10 mb-20 mt-32 flex w-full flex-col items-center justify-center rounded-3xl border border-white/20 bg-black/50 p-4 pb-8 pt-12 md:px-16 md:py-12 lg:px-24">
    //         <ProgressProvider initialStep={currentStep}>
    //           {currentStep !== 3 && (
    //             <div className="mb-10 flex w-full flex-col items-center justify-between gap-3 lg:flex-row">
    //               <h1 className="text-xl lg:text-2xl">Register to Hackfest</h1>

    //               <div className="flex flex-wrap items-center justify-center gap-5">
    //                 <a
    //                   href="https://bit.ly/reg_guidelines"
    //                   target="_blank"
    //                   rel="noreferrer"
    //                 >
    //                   <Button className="w-max gap-3">
    //                     <span className="hidden md:flex">Read Guidelines</span>
    //                     <BookOpen size="16" />
    //                   </Button>
    //                 </a>

    //                 <div className="flex gap-5">
    //                   <a href="https://discord.gg/d9hQV8Hcv6">
    //                     <Button>
    //                       <FaDiscord className="text-blue-500" size="20" />
    //                     </Button>
    //                   </a>
    //                   <LogoutButton />
    //                 </div>
    //               </div>
    //             </div>
    //           )}
    //           {currentStep < 3 ? (
    //             <>
    //               <div className="flex w-full flex-col gap-5 md:gap-8">
    //                 <Progress />
    //                 <RegisterProfile />
    //                 {user.team ? (
    //                   <TeamDetails
    //                     userRefetch={refetch}
    //                     userId={user.id}
    //                     teamid={user.team.id}
    //                     userProgress={user.profileProgress}
    //                   />
    //                 ) : (
    //                   <CreateTeam refetch={refetch} />
    //                 )}
    //                 <IdeaSubmitForm refetch={refetch} />
    //                 <FormButtons
    //                   isComplete={user.team?.isComplete ? true : false}
    //                   profileProgress={user.profileProgress}
    //                   isLeader={user.isLeader}
    //                   isInTeam={user.team ? true : false}
    //                 />
    //               </div>

    //               <div className=" flex w-full flex-col gap-1 rounded-2xl border-2 border-teal-600 bg-gradient-to-br from-teal-700/50 via-teal-300/50 to-teal-700/50 px-5 py-2 mt-6 text-sm text-white backdrop-blur-2xl md:text-base xl:text-lg">
    //           <p className="flex md:flex-row flex-col w-full justify-center items-center gap-2">
    //             <span className="font-semibold">Technical Issues? </span>
    //             <a href="https://discord.gg/d9hQV8Hcv6">
    //               <button className="bg-white text-sm px-3 py-1 rounded-md text-black">Join Our Discord</button>
    //             </a>
    //             <span>Or</span>
    //             <Link href="/contact">
    //              <button className="bg-white text-sm px-3 py-1 rounded-md text-black">Reach out to us</button>
    //             </Link>
    //           </p>

    //         </div>
    //             </>
    //           ) : (
    //             <Registered />
    //           )}
    //         </ProgressProvider>
    //       </div>
    //     </div>
    //   </main>
    // </RootLayout>

    <RootLayout>
      <div
        className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-[url("/images/blue-grainy.png")] bg-cover bg-center px-5 py-40 md:p-40`}
      >
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center bg-black/20"></div>

        <div className="z-10 flex w-full flex-col items-center justify-center rounded-3xl border border-white/20 bg-black/50 px-5 py-10">
          <div className="flex flex-col justify-center text-center">
            <h1 className="bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl font-black text-transparent md:text-6xl">
              Registrations closed
            </h1>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
