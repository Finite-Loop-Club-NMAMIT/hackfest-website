import React from "react";
import { useSearchParams } from "next/navigation";

import NoRoom from "./noRoom";
import MessageList from "./messageList";

export default function ChatWindow() {
  const searchParams = useSearchParams().get("room");

  if (searchParams === null) {
    return <NoRoom />;
  } else {
    return <MessageList roomId={searchParams}/>;
  }
}
