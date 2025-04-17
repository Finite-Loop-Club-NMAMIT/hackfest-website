import { cn } from "~/lib/utils";
import ChatNavbar from "../chat/navbar";
import ChatList from "../chat/chatList";
import ChatWindow from "../chat/chatWindow";
import { Toaster } from "sonner";

export default function ChatLayout({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
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
        <ChatList />
        <div className="flex-1 overflow-hidden">
          <ChatWindow />
        </div>
      </div>
      {/* {children} */}
    </div>
  );
}
