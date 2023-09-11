import type { JSX } from "preact";
import type { ClientInfo } from "../server.ts";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { useEffect, useState } from "preact/hooks";

export default function ClientDropdown(
  props: JSX.HTMLAttributes<HTMLSelectElement>,
) {
  const [clients, setClients] = useState<ClientInfo[]>([]);

  const fetchClients = async () => {
    const res = await fetch("/api/clients");
    const clients = await res.json();
    setClients(clients);
  };

  useEffect(() => {
    const interval = setInterval(fetchClients, 10000);
    fetchClients();
    return () => clearInterval(interval);
  }, []);

  return (
    <select
      {...props}
      type={"dropdown"}
      disabled={!IS_BROWSER || props.disabled}
      class={`px-3 py-2 bg-white rounded border(gray-500 2) disabled:(opacity-50 cursor-not-allowed) ${
        props.class ?? ""
      }`}
    >
      {clients.map((client) => (
        <option value={client.clientId}>
          {client.fetched ? client.username : client.clientId}
        </option>
      ))}
    </select>
  );
}
