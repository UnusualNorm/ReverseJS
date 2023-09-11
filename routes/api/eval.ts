import type { HandlerContext } from "$fresh/server.ts";
import type { GlobalState } from "../_middleware.ts";
import { isClientConnected, onEval } from "../../server.ts";

export const handler = async (
  req: Request,
  ctx: HandlerContext<unknown, GlobalState>,
): Promise<Response> => {
  const userId = ctx.state.id;

  const clientId = req.headers.get("x-client-id");
  if (!clientId || !isClientConnected(clientId)) {
    return new Response(null, { status: 404 });
  }

  const userCode = await req.text();
  if (!userCode) {
    return new Response(null, { status: 400 });
  }

  onEval(clientId, userId, userCode);
  return new Response(null, { status: 202 });
};
