import type { ClientMessage } from "../server.ts";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { useRef, useState } from "preact/hooks";
import { signal } from "@preact/signals";

export const fetchMessages = async (): Promise<ClientMessage[]> => {
  const res = await fetch("/api/messages");
  return await res.json();
};

export const messages = signal<ClientMessage[]>([]);
if (IS_BROWSER) {
  setInterval(async () => {
    messages.value = [...messages.value, ...(await fetchMessages())];
  }, 2000);
}

export const useMessages = (): ClientMessage[] => {
  const [data, setData] = useState<ClientMessage[]>(messages.value);
  const subscribedRef = useRef(false);

  if (IS_BROWSER && !subscribedRef.current) {
    messages.subscribe(setData);
    subscribedRef.current = true;
  }

  return data;
};
