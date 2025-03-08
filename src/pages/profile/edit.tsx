import React, { useContext } from "react";
import RootLayout from "~/components/layout";
import * as AppSettings from "~/components/appSettingValidator/index";
import GradientBackground from "~/components/layout/backgroundGradient";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/router";

export default function Page() {
  return (
    <RootLayout>
      <GradientBackground className="flex justify-center items-center bg-white">
        <AppSettings.Provider>
          <EditProfile />
        </AppSettings.Provider>
      </GradientBackground>
    </RootLayout>
  );
}

function EditProfile() {
  const settings = useContext(AppSettings.context);
  const router = useRouter();

  if(!settings.settings?.isProfileEditOpen){
    return (
      <div className="w-full max-w-3xl rounded-xl border border-white/20 bg-black/50 px-5 py-10">
        <div className="flex flex-col justify-center text-center">
          <h1 className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-5xl font-black text-transparent md:text-7xl">
            Oops!
          </h1>

          <p className="text-md mb-5 mt-4 text-gray-300">
            Profile editing is currently not available right now.
          </p>

          <Button className="w-fit mx-auto" onClick={() => { router.back()}}>Go Back</Button>
          {/* <SignInButton /> */}
        </div>
      </div>
    );
  }

  return <></>;
}
