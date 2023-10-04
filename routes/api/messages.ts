import type { HandlerContext } from "$fresh/server.ts";
import type { GlobalState } from "../_middleware.ts";
import { clearMessages, messages } from "../../server.ts";

export const handler = (
  _req: Request,
  ctx: HandlerContext<unknown, GlobalState>,
): Response | Promise<Response> => {
  const id = ctx.state.id;
  const msgs = messages.get(id);

  const response = new Response(JSON.stringify(msgs ?? []), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });

  clearMessages(id);
  return response;
};
