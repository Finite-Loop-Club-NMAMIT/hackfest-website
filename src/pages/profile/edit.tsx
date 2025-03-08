import React, { useContext } from "react";
import RootLayout from "~/components/layout";
import * as AppSettings from "~/components/appSettingValidator/index";
import GradientBackground from "~/components/layout/backgroundGradient";

export default function Page() {
  return (
    <RootLayout>
      <GradientBackground>
        <AppSettings.Provider>
          <EditProfile />
        </AppSettings.Provider>
      </GradientBackground>
    </RootLayout>
  );
}

function EditProfile() {
  const settings = useContext(AppSettings.context);

  if(!settings.settings?.isProfileEditOpen){
    return <>Profile edit is not open</>;
  }

  return <>hello</>;
}
