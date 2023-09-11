import { HandlerContext } from "$fresh/server.ts";
import { onConnection } from "../server.ts";

export const handler = (
  req: Request,
  ctx: HandlerContext,
): Response | Promise<Response> => {
  if (req.headers.get("upgrade") != "websocket") {
    return ctx.renderNotFound();
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  onConnection(socket);

  return response;
};
