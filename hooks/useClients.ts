import type { ClientInfo } from "../server.ts";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { useEffect, useState } from "preact/hooks";
import { signal } from "@preact/signals";

export const fetchClients = async (): Promise<ClientInfo[]> => {
  const res = await fetch("/api/clients");
  // Extremely minor race condition here.
  // A client could connect with websocket as we're parsing JSON,
  // causing them to be overwritten and excluded from the list
  const json = await res.json();
  // The api gives us a complete list of clients
  clients.value = json;
  return json;
};

export const clients = signal<ClientInfo[]>([]);
if (IS_BROWSER) {
  fetchClients();
  const websocketUrl = `ws${
    location.protocol === "https:" ? "s" : ""
  }://${location.host}/api/clients`;
  const websocket = new WebSocket(websocketUrl);
  websocket.onmessage = (ev) => {
    const [connected, clientId] = JSON.parse(ev.data);
    if (connected) {
      clients.value = [...clients.value, {
        clientId,
        fetched: false,
      }];
    } else {
      clients.value = clients.value.filter((client) =>
        client.clientId !== clientId
      );
    }
  };

  websocket.onclose = () => {
    setTimeout(() => {
      clients.value = [];
      fetchClients();
    }, 2500);
  };
}

export const useClients = (): [
  previousClients: ClientInfo[],
  clients: ClientInfo[],
] => {
  const [previousData, setPreviousData] = useState<ClientInfo[]>([]);
  const [data, setData] = useState<ClientInfo[]>(clients.value);

  useEffect(() => {
    if (!IS_BROWSER) return;
    clients.subscribe((clients) => {
      setPreviousData(data);
      setData(clients);
    });
  }, [IS_BROWSER]);

  return [previousData, data];
};
