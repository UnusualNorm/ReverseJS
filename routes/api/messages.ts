import type { HandlerContext } from "$fresh/server.ts";
import type { GlobalState } from "../_middleware.ts";
import { clearMessages, messages } from "../../server.ts";

export const sockets = new Map<string, WebSocket>();

export const handler = (
  req: Request,
  ctx: HandlerContext<unknown, GlobalState>,
): Response | Promise<Response> => {
  const id = ctx.state.id;
  const msgs = messages.get(id);

  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    sockets.set(id, socket);
    socket.onclose = () => sockets.delete(id);
    return response;
  }

  const response = new Response(JSON.stringify(msgs ?? []), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });

  clearMessages(id);
  return response;
};
