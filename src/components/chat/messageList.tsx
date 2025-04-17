import React, { useEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import { type inferRouterOutputs } from "@trpc/server";
import { type chatRotuer } from "~/server/api/routers/chat";
import { useSession } from "next-auth/react";
import { roomInfoZ } from "~/server/schema/zod-schema";

import { Send, Users, Copy } from "lucide-react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import Spinner from "../spinner";
import { pusherClient } from "~/utils/pusher";

export default function MessageList({ roomId }: { roomId: string }) {
  // session and TRPC functions
  const session = useSession();
  const roomInfoQuery = api.chat.getRoomInfo.useQuery(roomId);
  const sendMessageMutation = api.chat.sendMessage.useMutation();
  const getPreviousMessagesQuery = api.chat.getPreviousMessages.useQuery(
    roomInfoZ.parse(roomId),
  );
  const [messages, setMessages] = useState<
    inferRouterOutputs<typeof chatRotuer>["getPreviousMessages"]["data"]
  >([]);

  // state for message input
  const [message, setMessage] = useState("");
  const messageRef = useRef<HTMLDivElement>(null)

  // effect to set previous messages
  useEffect(() => {
    if (getPreviousMessagesQuery.data) {
      setMessages(getPreviousMessagesQuery.data.data);
    }
  }, [getPreviousMessagesQuery.data]);


  // Puseher subscription
  useEffect(() => {
    const channel = pusherClient.subscribe(roomId);
    channel.bind(
      "new_message",
      (data: {
        id: string;
        createdAt: string;
        content: string;
        sender: {
          name: string | null;
          id: string;
        };
      }) => {
        setMessages((prev) => [
          ...prev,
          {
            ...data,
            createdAt: new Date(data.createdAt),
          },
        ]);
      },
    );

    return () => {
      channel.unbind("new_message");
      pusherClient.unsubscribe(roomId);
    };
  }, [roomId]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessageMutation.mutate({
        content: message,
        // isCode: isCode,
        roomId: roomId,
      });

      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Scroll to bottom function
  const scrollToBotton = () => {
    if(messageRef.current){
      // messageRef.current.scrollTop = messageRef.current.scrollHeight;
      messageRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  useEffect(() => {
    // console.log(messages.map((msg) => msg.createdAt))
    scrollToBotton();
  }, [messages]);

  if (getPreviousMessagesQuery.isLoading || roomInfoQuery.isLoading) {
    return (
      <div className="relative flex h-full w-full flex-col bg-gradient-to-b from-[#0b1328] from-[10%] via-[#153164] to-[#0b1328]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-gradient-to-b from-[#0b1328] from-[10%] via-[#153164] to-[#0b1328]">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b border-blue-900 px-6 py-3">
        <div className="flex items-center">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white">
              <Users />
            </div>
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-white">
              {roomInfoQuery.data?.room?.chatRoom.name ?? "Chat Room"}
            </h3>
            {/* <p className="w-fit max-w-40 truncate text-xs text-white">
              {roomInfoQuery.data?.room?.chatRoom.participants.map(
                (user) => user.user.name,
              )}
            </p> */}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={async () => {
              if (roomId) {
                await navigator.clipboard.writeText(roomId);
                toast.success("Room ID copied to clipboard!");
              }
            }}
            variant="ghost"
            className="flex gap-2 rounded-full border border-blue-800 text-blue-300 hover:bg-blue-900 hover:text-white"
          >
            Room ID
            <Copy className="size-5" />
          </Button>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-grow space-y-4 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender.id === session.data?.user.id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                msg.sender.id === session.data?.user.id
                  ? "rounded-tr-none bg-blue-700 text-white"
                  : "rounded-tl-none bg-blue-900/60 text-white"
              }`}
            >
              {!(msg.sender.id === session.data?.user.id) && (
                <p className="text-xs font-medium text-blue-300">
                  {msg.sender.name ?? "Unknown"}
                </p>
              )}
              <p className="text-sm">{msg.content}</p>
              <p className="mt-1 text-right text-xs text-blue-300">
                {msg.createdAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messageRef} />
      </div>

      {/* Message input */}
      <div className="border-t border-blue-900 p-4">
        <div className="flex items-center gap-2 rounded-full bg-blue-900/50 px-4 py-2">
        {/* is code toggle */}
          {/* <button
            className="h-8 w-16 rounded-full bg-blue-800 text-blue-300 transition-colors duration-300 hover:bg-blue-700"
            onClick={() => setIsCode((val) => !val)}
          >
            <div
              className={`flex aspect-square h-full w-fit items-center justify-center rounded-full bg-transparent transition-transform duration-300 ${!isCode ? "translate-x-0" : "translate-x-full"}`}
            >
              {isCode ? (
                <Code className="rounded-full bg-blue-50 p-0.5 text-black" />
              ) : (
                <Type className="rounded-full bg-blue-50 p-0.5 text-black" />
              )}
            </div>
          </button> */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="max-h-32 flex-grow resize-none bg-transparent pl-2 text-white placeholder-blue-300 focus:outline-none"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            size="icon"
            className={`rounded-full ${!message.trim() ? "bg-blue-800 text-blue-400" : "bg-blue-600 text-white hover:bg-blue-500"}`}
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
