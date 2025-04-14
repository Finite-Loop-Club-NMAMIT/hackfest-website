import { useSession } from "next-auth/react";
import React from "react";
import RootLayout from "~/components/layout";
import GradientBackground from "~/components/layout/backgroundGradient";
import ChatLayout from "~/components/layout/chatLayout";
import NotLoggedIn from "~/components/notLoggedIn";
import TridentSpinner from "~/components/spinner/thunderSpinner";
import { Button } from "~/components/ui/button";
import { usePusher } from "~/hooks/usePusher";

export default function ChatPage() {
  // const { emit } = usePusher({
  //   channel: "global",
  //   binds: [
  //     {
  //       event: "new_message",
  //       callback: (data) => {
  //         console.log("data from server", data);
  //       },
  //     },
  //   ],
  // });

  const session = useSession();

  if (session.status === "loading") {
    return <TridentSpinner />;
  } else if (session.status === "unauthenticated") {
    return <NotLoggedIn />;
  } else if (session.status === "authenticated") {
    return (
      <ChatLayout/>
    );
  }
}
