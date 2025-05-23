import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import RootLayout from "~/components/layout";
import NotLoggedIn from "~/components/notLoggedIn";
import RegisterCards from "~/components/registrationProgress";
import TridentSpinner from "~/components/spinner/thunderSpinner";
import VideoSubmission from "~/components/videosubmission";
import { api } from "~/utils/api";

export default function Register() {
  const { data, status } = useSession();
  const [delay, setDelay] = useState(true);
  const appSettings = api.appSettings.getAppSettings.useQuery();

  useEffect(() => {
    setTimeout(() => {
      setDelay(false);
    }, 1000);
  }, []);

  if (status === "loading" || delay || appSettings.isLoading) {
    return <TridentSpinner message="is arriving to gather your details" />;
  } else if (status === "unauthenticated") {
    return <NotLoggedIn />;
  } else {
    return (
      <RootLayout>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0b1328] from-[10%] via-[#153164] to-[#0b1328] px-2 py-40">
          {data?.user &&
            appSettings.data &&
            (data.user.team?.teamProgress === "SELECTED" &&
            data.user.team.attended ? (
              <VideoSubmission
                session={data}
              />
            ) : (
              <RegisterCards
                progress={data.user.profileProgress}
                settings={appSettings.data}
                session={data}
              />
            ))}
        </div>
      </RootLayout>
    );
  }
}
