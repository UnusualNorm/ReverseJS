import { REVERSEJS_BUNDLER } from "../../env.ts";

import type { HandlerContext } from "$fresh/server.ts";
import type { GlobalState } from "../_middleware.ts";
import { bundle } from "emit";

export const handler = async (
  req: Request,
  _ctx: HandlerContext<unknown, GlobalState>,
): Promise<Response> => {
  // TODO: Fix this
  // We have three options:
  // 1. Fix deno_emit on deploy
  // 2. Use a different bundler
  // 3. Set up a custom solution for providing the code to bundle.deno.dev

  const userCode = await req.text();
  if (!userCode) {
    return new Response(null, { status: 400 });
  }

  if (!REVERSEJS_BUNDLER) {
    try {
      const bundled = await bundle(
        "data:application/typescript," + encodeURIComponent(userCode),
      );

      return new Response(bundled.code, { status: 200 });
    } catch (error) {
      return new Response(String(error), { status: 500 });
    }
  }

  const url = new URL(REVERSEJS_BUNDLER);
  const response = await fetch(url, {
    method: "POST",
    body: userCode,
  });

  return response;
};
