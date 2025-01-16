// import Image from "next/image";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "../ui/card";
// import { EditProfileForm } from "./editProfileForm";
// import { api } from "~/utils/api";
// import { type inferRouterOutputs } from "@trpc/server";
// import { type userRouter } from "~/server/api/routers/user";
// import { QRCodeSVG } from "qrcode.react";

// export const Profile: React.FC<{
//   user:
//     | inferRouterOutputs<typeof userRouter>["getUserWithTeam"]
//     | null
//     | undefined;
//   refetch: () => void;
// }> = ({ user, refetch }) => {
//   const colleges = api.college.getColleges.useQuery();

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle className="text-center">Your profile</CardTitle>
//       </CardHeader>
//       <CardContent className="flex flex-col items-center justify-center gap-2 px-2">
//         <Card className="mx-2 w-full p-4 md:w-fit">
//           <CardContent className="flex items-center justify-center gap-5">
//             <Image
//               src={user!.image!}
//               alt="Profile image"
//               width={150}
//               height={150}
//               className="h-32 w-32 rounded-xl"
//             />
//             {user?.id &&
//               user?.team?.paymentStatus === "PAID" &&
//               user?.team?.teamProgress === "SELECTED" && (
//                 <QRCodeSVG
//                   value={user?.id ?? ""}
//                   size={130}
//                   bgColor="transparent"
//                   color="#ffffff"
//                   fgColor="#ffffff"
//                   className="h-32 w-32"
//                 />
//               )}
//           </CardContent>
//           <CardFooter className="p-0">
//             <h1 className="text-md w-full whitespace-nowrap text-center font-semibold md:text-lg">
//               {user?.name}
//             </h1>
//           </CardFooter>
//         </Card>
//         <EditProfileForm
//           user={user!}
//           colleges={colleges.data}
//           refetch={refetch}
//           collegeRefetch={colleges.refetch}
//         />
//       </CardContent>
//     </Card>
//   );
// };

import { useSession } from "next-auth/react";
import React from "react";
import { Input } from "../ui/input";
import { Building2, Github, Mail, Phone } from "lucide-react";
import { FaHouseFlag } from "react-icons/fa6";
import { Button } from "../ui/button";
import { useRouter } from "next/router";
import { type inferRouterOutputs } from "@trpc/server";
import { type userRouter } from "~/server/api/routers/user";
import Image from "next/image";

export default function ProfileCard({
  user,
}: {
  user: inferRouterOutputs<typeof userRouter>["getUserDetails"];
}) {
  const { data } = useSession();
  const router = useRouter();

  return (
    <>
      <div className="mb-4 text-center text-2xl font-semibold">
        Hello {data?.user.name ?? "User"}!
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <div className="flex h-full w-full flex-col gap-4 rounded-md border-2 p-2">
          <h1 className="text-xl">Personal Details</h1>
          <div className="flex h-auto w-full flex-nowrap">
            <div className="flex items-center text-left">
              <Mail className="ml-auto size-8 h-full  rounded-l-md border-[1px] border-r-[0px] bg-black/30 p-1" />
            </div>
            <Input
              readOnly
              className="rounded-l-none pl-5 focus-visible:ring-[0px]"
              value={user?.email ?? "goofer@hackfest.dev"}
            />
          </div>
          <div className="flex h-auto w-full flex-nowrap">
            <div className="flex items-center text-left">
              <Phone className="ml-auto size-8 h-full  rounded-l-md border-[1px] border-r-[0px] bg-black/30 p-1" />
            </div>
            <Input
              readOnly
              className="rounded-l-none pl-5 focus-visible:ring-[0px]"
              value={user?.phone ?? "0123456789"}
            />
          </div>
          <div className="flex h-auto w-full flex-nowrap">
            <div className="flex items-center text-left">
              <Building2 className="ml-auto size-8 h-full  rounded-l-md border-[1px] border-r-[0px] bg-black/30 p-1" />
            </div>
            <Input
              readOnly
              className="rounded-l-none pl-5 focus-visible:ring-[0px]"
              value={user?.college?.name ?? "University of Full time coders"}
            />
          </div>
          <div className="flex h-auto w-full flex-nowrap">
            <div className="flex items-center text-left">
              <FaHouseFlag className="ml-auto size-8 h-full  rounded-l-md border-[1px] border-r-[0px] bg-black/30 p-1" />
            </div>
            <Input
              readOnly
              className="rounded-l-none pl-5 focus-visible:ring-[0px]"
              value={user?.college?.state ?? "State not selected"}
            />
          </div>
          <div className="flex h-auto w-full flex-nowrap">
            <div className="flex items-center text-left">
              <Github className="ml-auto size-8 h-full  rounded-l-md border-[1px] border-r-[0px] bg-black/30 p-1" />
            </div>
            <Input
              readOnly
              className="rounded-l-none pl-5 focus-visible:ring-[0px]"
              value={user?.github ?? "University of Full time coders"}
            />
          </div>
        </div>
        <div className="flex h-full w-full flex-col gap-4 rounded-md border-2 p-2">
          <h1 className="text-xl">Team Details</h1>
          {user?.team ? (
            <>you are in a team</>
          ) : (
            <div
              className="flex h-full flex-col justify-center
             rounded-md bg-gradient-to-b from-red-500 via-red-600 to-red-400 p-4 text-center text-xl font-semibold text-black"
            >
              <p>You are not in any team</p>
              <div className="mt-4 flex justify-center gap-4">
                <Button
                  onClick={async () => {
                    await router.push("/register", {
                      query: {
                        t: "join",
                      },
                    });
                  }}
                >
                  Join Team
                </Button>
                <Button
                  onClick={async () => {
                    await router.push("/register", {
                      query: {
                        t: "create",
                      },
                    });
                  }}
                >
                  Create Team
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="mx-auto flex h-full w-fit flex-col gap-4 rounded-md border-2 p-2 md:col-span-2">
          <h1 className="text-xl">Identify Proofs</h1>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="container">
                {user?.aadhaar && (
                  <Image
                    src={user?.aadhaar.split(";")[0] ?? ""}
                    className=" size-56 p-2 border-2"
                    height={100}
                    width={100}
                    alt="aadhaar"
                  />
                )}
              </div>
              <p className="mt-2 text-center">Aadhaar</p>
            </div>
            <div>
              <div className="container">
                {user?.aadhaar && (
                  <Image
                    src={user?.college_id?.split(";")[0] ?? ""}
                    className="size-56 p-2 border-2"
                    height={100}
                    width={100}
                    alt="college ID"
                  />
                )}
              </div>
              <p className="mt-2 text-center">College ID</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
