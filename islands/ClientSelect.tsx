import type { JSX } from "preact";
import { useClients } from "hooks/useClients.ts";

import Select from "islands/Select.tsx";

export default function ClientSelect(
  props: JSX.HTMLAttributes<HTMLSelectElement>,
) {
  const clients = useClients();

  return (
    <Select {...props}>
      {clients.map((client) => (
        <option value={client.clientId}>
          {client.fetched ? client.username : client.clientId}
        </option>
      ))}
    </Select>
  );
}
