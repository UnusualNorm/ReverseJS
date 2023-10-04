import type { ClientInfo } from "../server.ts";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { useRef, useState } from "preact/hooks";
import { signal } from "@preact/signals";

export const fetchClients = async (): Promise<ClientInfo[]> => {
  const res = await fetch("/api/clients");
  return await res.json();
};

export const clients = signal<ClientInfo[]>([]);
if (IS_BROWSER) {
  setInterval(async () => {
    clients.value = await fetchClients();
  }, 10000);
}

export const useClients = (): ClientInfo[] => {
  const [data, setData] = useState<ClientInfo[]>(clients.value);
  const subscribedRef = useRef(false);

  if (IS_BROWSER && !subscribedRef.current) {
    clients.subscribe(setData);
    subscribedRef.current = true;
  }

  return data;
};
