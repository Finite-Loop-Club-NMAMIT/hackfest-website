import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import RootLayout from "~/components/layout";
import NotLoggedIn from "~/components/notLoggedIn";
import RegisterCards from "~/components/registrationProgress";
import TridentSpinner from "~/components/spinner/thunderSpinner";

export default function Register() {
  const { data, status } = useSession();
  const [delay, setDelay] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setDelay(false);
    }, 1000);
  }, []);

  if (status === "loading" || delay) {
    return <TridentSpinner message="is arriving to gather your details" />;
  } else if (status === "unauthenticated") {
    return <NotLoggedIn />;
  } else {
    return (
      <RootLayout>
        <div className="min-h-screen bg-gradient-to-b from-[#0b1328] from-[10%] via-[#153164] to-[#0b1328]">
          {data?.user && <RegisterCards progress={data.user.profileProgress}/>}
        </div>
      </RootLayout>
    );
  }
}
