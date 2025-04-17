/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";

import {
  PanelLeftOpen,
  PanelRightOpen,
  Plus,
  Users,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { DialogClose, DialogFooter } from "../ui/modal";
import { toast } from "sonner";
import Spinner from "../spinner";
import { type inferRouterOutputs } from "@trpc/server";
import { type chatRotuer } from "~/server/api/routers/chat";
import { pusherClient } from "~/utils/pusher";

export default function ChatList({
  list,
  status,
}: {
  list: inferRouterOutputs<typeof chatRotuer>["getChatRoomList"];
  status: "error" | "loading" | "success";
}) {
  const router = useRouter();
  const session = useSession();

  const [collapsed, setCollapsed] = useState(
    typeof window !== "undefined"
      ? window.innerWidth < 768 // Typically, 768px or less is considered mobile view
        ? true
        : false
      : false,
  );
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null,
  );
  const [chatList, setChatList] =
    useState<inferRouterOutputs<typeof chatRotuer>["getChatRoomList"]>(list);

  // create and join values
  const [createRoom, setCreateRoom] = useState("");
  const [joinRoom, setJoinRoom] = useState("");
  // Dialog States
  const [createRoomDialog, setCreateRoomDialog] = useState(false);
  const [joinRoomDialog, setJoinRoomDialog] = useState(false);

  // Queries and mutations
  // const chatRoomQuery = api.chat.getChatRoomList.useQuery();
  const createRoomMutation = api.chat.createRoom.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: async () => {
      toast.success("Successfully create Room");
      setCreateRoomDialog(false);
      // await list.refetch();
    },
  });
  const joinRoomMutation = api.chat.joinRoom.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: async () => {
      toast.success("Successfully joined Room");
      setJoinRoomDialog(false);
      // await chatRoomQuery.refetch();
    },
  });

  // useEffect(() => {
  //   if (chatRoomQuery.status === "success") {
  //     setChatList(chatRoomQuery.data);
  //   }
  // }, [chatRoomQuery]);

  useEffect(() => {
    const channel = pusherClient.subscribe(session.data?.user.id ?? "pending");
    channel.bind(
      "notification",
      (data: {
        sender: string;
        roomId: string;
        data: {
          id: string;
          content: string;
          createdAt: string;
          sender: {
            id: string | null;
            name: string;
          };
        };
      }) => {
        const otherList = chatList.filter(
          (contact) => contact.chatRoom.id !== data.roomId,
        );
        const newData = chatList.filter(
          (contact) => contact.chatRoom.id === data.roomId,
        );

        const newList = [
          ...otherList,
          {
            ...newData[0],
            notification: (newData[0]?.notification ?? 0) + 1,
          },
        ] as unknown as inferRouterOutputs<
          typeof chatRotuer
        >["getChatRoomList"];
        console.log(newList);

        setChatList(newList);
      },
    );

    return () => {
      channel.unbind("notification");
      pusherClient.unsubscribe(session.data?.user.id ?? "pending");
    };
  }, [chatList, session.data]);

  return (
    <div
      className={`${
        collapsed ? "w-16" : "w-80"
      } h-[calc(100vh-6rem)] transform border-t border-blue-900 py-[1px] transition-all duration-300 ease-in-out will-change-transform`}
    >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-r-xl bg-blue-950 text-white">
        <div className="flex h-16 w-full items-center justify-between border-b border-blue-900 px-3">
          {!collapsed && <h2 className="pl-2 text-xl font-semibold">Chats</h2>}
          <button
            onClick={() => {
              if (typeof window !== undefined) {
                if (window.innerWidth < 768) {
                  return;
                }
              }
              setCollapsed((val) => !val);
            }}
            className="flex items-center justify-center rounded-full p-3 text-white transition-colors duration-200 hover:bg-blue-900"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelRightOpen />}
          </button>
        </div>

        {/* <div className="flex border-b border-blue-900 p-3">
          {!collapsed ? (
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full rounded-full bg-blue-900/50 py-2 pl-10 pr-4 text-sm text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Search className="absolute left-3 top-2 h-5 w-5 text-blue-300" />
            </div>
          ) : (
            <button className="mx-auto rounded-full p-3 hover:bg-blue-900">
              <Search className="h-5 w-5" />
            </button>
          )}
        </div> */}

        {session.data?.user.role === "ADMIN" && (
          <div className="flex flex-col gap-2 border-b border-blue-900 p-3">
            <>
              <Dialog
                open={createRoomDialog}
                onOpenChange={setCreateRoomDialog}
              >
                <DialogTrigger asChild>
                  {!collapsed ? (
                    <Button
                      className="justify-start gap-2 bg-blue-900 hover:bg-blue-800"
                      size="sm"
                    >
                      <Plus size={16} /> New Chat
                    </Button>
                  ) : (
                    <Button
                      className="mx-auto rounded-full bg-blue-900 p-2 hover:bg-blue-800"
                      size="icon"
                    >
                      <Plus size={18} />
                    </Button>
                  )}
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Chat</DialogTitle>
                    <DialogDescription>
                      Create a new Chat room for you and your team to
                      communicate.
                      <Input
                        placeholder="Room name"
                        className="mt-4 placeholder:opacity-70"
                        onChange={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          const target = e.target;

                          if (target) {
                            setCreateRoom(target.value);
                          }
                        }}
                      />
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant={"destructive"}>Cancel</Button>
                    </DialogClose>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (createRoom.length < 3) {
                          toast.error(
                            "Room name must be greater than 3 characters",
                          );
                        } else if (createRoom.length > 15) {
                          toast.error(
                            "Room name must not exceed more that 15 characters",
                          );
                        } else {
                          createRoomMutation.mutate(createRoom);
                        }
                      }}
                    >
                      Create
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={joinRoomDialog} onOpenChange={setJoinRoomDialog}>
                <DialogTrigger asChild>
                  {!collapsed ? (
                    <Button
                      className="justify-start gap-2 bg-blue-900 hover:bg-blue-800"
                      size="sm"
                    >
                      <Users size={16} /> Join Chat
                    </Button>
                  ) : (
                    <Button
                      className="mx-auto rounded-full bg-blue-900 p-2 hover:bg-blue-800"
                      size="icon"
                    >
                      <Users size={18} />
                    </Button>
                  )}
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join Chat</DialogTitle>
                    <DialogDescription>
                      <p>Join existing chat room for communication.</p>
                      <Input
                        placeholder="Room Id"
                        className="mt-4 placeholder:opacity-70"
                        onChange={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          const target = e.target;

                          if (target) {
                            setJoinRoom(target.value);
                          }
                        }}
                      />
                    </DialogDescription>
                    <DialogFooter className="pt-2">
                      <DialogClose asChild>
                        <Button variant={"destructive"}>Cancel</Button>
                      </DialogClose>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          if (joinRoom.length < 3) {
                            toast.error(
                              "Room id must be greater than 3 characters",
                            );
                          } else {
                            joinRoomMutation.mutate(joinRoom);
                          }
                        }}
                      >
                        Join
                      </Button>
                    </DialogFooter>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </>
          </div>
        )}

        {/* Loader */}
        {status === "loading" && <Spinner />}

        {/* Error */}
        {/* {status === "error" &&
          chatRoomQuery.error.data?.code === "UNAUTHORIZED" && (
            <div className="mt-8 flex flex-col items-center justify-center gap-4">
              <AlertCircle className="size-10 stroke-destructive" />
              <p className="px-4 text-center text-xl opacity-80">
                You are not allowed to use the chat feature
              </p>
            </div>
          )} */}

        {/* Contact List */}
        <div className="scrollbar-thin scrollbar-thumb-blue-900 scrollbar-track-transparent flex-grow overflow-y-auto">
          {chatList.map((contact) => (
            <div
              key={contact.chatRoom.id}
              className={`flex cursor-pointer items-center p-3 transition-colors hover:bg-blue-900/50 ${selectedContactId === contact.chatRoom.id ? "bg-blue-900" : ""}`}
              onClick={async () => {
                setSelectedContactId(contact.chatRoom.id);
                setChatList((prevList) =>
                  prevList.map((item) =>
                    item.chatRoom.id === contact.chatRoom.id
                      ? { ...item, notification: 0 }
                      : item
                  )
                );
                await router.push(`/chat`, {
                  query: {
                    room: contact.chatRoom.id,
                  },
                });
              }}
            >
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-800 text-lg">
                  {/* {contact.avatar} */}
                  <Users />
                </div>
              </div>

              {!collapsed && (
                <>
                  <div className="ml-3 w-full overflow-hidden">
                    <p className="truncate font-medium">
                      {contact.chatRoom.name}
                    </p>
                    <p className="truncate text-xs text-blue-300">
                      {contact.chatRoom.messages[0]?.content ?? ""}
                    </p>
                  </div>
                  {contact.notification > 0 && (
                    <div className="text-sm text-white">
                      <div className="flex size-6 items-center justify-center rounded-full bg-red-500 text-center">
                        {/* {contact.notification} */}!
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
