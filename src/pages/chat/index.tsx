import { useSession } from "next-auth/react";
import React from "react";

import ChatLayout from "~/components/layout/chatLayout";
import NotLoggedIn from "~/components/notLoggedIn";
import TridentSpinner from "~/components/spinner/thunderSpinner";

export default function ChatPage() {

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
