/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { cn } from "~/lib/utils";
import ChatNavbar from "../chat/navbar";
import ChatList from "../chat/chatList";
import ChatWindow from "../chat/chatWindow";
import { Toaster } from "sonner";
import { api } from "~/utils/api";

export default function ChatLayout({
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const chatRoomQuery = api.chat.getChatRoomList.useQuery();

  return (
    <div
      className={cn(
        "flex h-screen w-full flex-col overflow-hidden bg-blue-950",
        className,
      )}
    >
      <Toaster richColors expand={false} position="bottom-center" />
      <ChatNavbar />
      <div className="flex flex-1 flex-row flex-nowrap overflow-hidden">
        {chatRoomQuery.status === "success" && (
          <ChatList
            list={chatRoomQuery.data ?? []}
            status={chatRoomQuery.status}
          />
        )}
        <div className="flex-1 overflow-hidden">
          <ChatWindow />
        </div>
      </div>
      {/* {children} */}
    </div>
  );
}
