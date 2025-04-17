import { useSession } from "next-auth/react";
import { useEffect, useCallback } from "react";
import { pusherClient } from "~/utils/pusher";

export const usePusher = ({
  channel,
  binds,
}: {
  channel: string;
  binds?: Array<{ event: string; callback: (data: unknown) => void }>;
}) => {
  const client = pusherClient.subscribe(channel);
  const { data: sessionData } = useSession();

  /**
   * Emits and event to the pusher server
   * @param event 
   * @param data 
   */
  const emit = (event: string, data: unknown) => {
    client.emit(event, {
      session: sessionData,
      data: data,
    });
  };

  /**
   * Bind to a pusher event
   ** it is not recommended to bind to the same event multiple times
   ** pass event as parameters to the hook itself
   * @param event
   * @param callback
   * @returns
   */
  const bind = useCallback((event: string, callback: (data: unknown) => void) => {
    const exists = client.callbacks.get(event);
    if (exists && exists.length > 0) {
      console.error("Event already bound inside hook", event);
      return;
    }
    client.bind(event, callback);
  }, [client]);

  useEffect(() => {
    if (binds && binds.length > 0) {
      binds.forEach((event) => {
        bind(event.event, event.callback);
      });
    }

    return () => {
      if (binds && binds.length > 0) {
        binds.forEach((event) => {
          client.unbind(event.event, event.callback);
        });
      }
      pusherClient.unsubscribe(channel);
    }
  }, [bind, binds, channel, client]);

  return {
    client,
    emit,
    bind,
  };
};
