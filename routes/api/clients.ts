import type { HandlerContext } from "$fresh/server.ts";
import type { GlobalState } from "../_middleware.ts";
import { getClients } from "../../server.ts";

export const handler = (
  _req: Request,
  _ctx: HandlerContext<unknown, GlobalState>,
): Response | Promise<Response> => {
  const clients = getClients();

  const response = new Response(JSON.stringify(clients ?? []), {
    headers: {
      "content-type": "application/json",
    },
  });

  return response;
};
