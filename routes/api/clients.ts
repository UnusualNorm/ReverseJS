import type { HandlerContext } from "$fresh/server.ts";
import type { GlobalState } from "../_middleware.ts";
import { getClients } from "../../server.ts";

export const sockets: WebSocket[] = [];

export const handler = (
  req: Request,
  _ctx: HandlerContext<unknown, GlobalState>,
): Response | Promise<Response> => {
  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    sockets.push(socket);
    socket.onclose = () => {
      const index = sockets.indexOf(socket);
      if (index !== -1) {
        sockets.splice(index, 1);
      }
    };

    return response;
  }

  const clients = getClients();

  const response = new Response(JSON.stringify(clients ?? []), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });

  return response;
};
