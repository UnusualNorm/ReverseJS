import type { ClientMessage } from "../server.ts";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { useEffect, useState } from "preact/hooks";
import { signal } from "@preact/signals";

export const fetchMessages = async (): Promise<ClientMessage[]> => {
  const res = await fetch("/api/messages");
  const json = await res.json();
  messages.value = [...messages.value, ...json];
  return json;
};

export const messages = signal<ClientMessage[]>([]);
if (IS_BROWSER) {
  fetchMessages();
  const websocketUrl = `ws${
    location.protocol === "https:" ? "s" : ""
  }://${location.host}/api/messages`;
  const websocket = new WebSocket(websocketUrl);
  websocket.onmessage = (ev) => {
    const data = JSON.parse(ev.data);
    messages.value = [...messages.value, data];
  };

  websocket.onclose = () => {
    setTimeout(() => {
      messages.value = [];
      fetchMessages();
    }, 2500);
  };
}

export const useMessages = (): [
  previousMessages: ClientMessage[],
  messages: ClientMessage[],
] => {
  const [previousData, setPreviousData] = useState<ClientMessage[]>([]);
  const [data, setData] = useState<ClientMessage[]>(messages.value);

  useEffect(() => {
    if (!IS_BROWSER) return;
    messages.subscribe((messages) => {
      setPreviousData(data);
      setData(messages);
    });
  }, [IS_BROWSER]);

  return [previousData, data];
};
