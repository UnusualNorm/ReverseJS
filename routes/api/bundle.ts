import { PASTEBIN_API_KEY } from "../../env.ts";

import type { HandlerContext } from "$fresh/server.ts";
import type { GlobalState } from "../_middleware.ts";
import { PasteClient } from "deno_pastebin";
import { bundle } from "emit";

const client = new PasteClient(PASTEBIN_API_KEY);

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

  let code: string;
  let errored = false;

  try {
    code = (await bundle(
      "data:application/typescript," + encodeURIComponent(userCode),
    )).code;
  } catch (_error) {
    errored = true;
  }

  // Backup plan: use pastebin
  try {
    const pasteUrl = await client.create({
      code: userCode,
      expireDate: "1M",
      publicity: 1,
    });

    const pasteId = pasteUrl.split("/").pop()!;

    const resp = await fetch(
      `https://bundle.deno.dev/https://pastebin.com/raw/${pasteId}`,
    );

    if (!resp.ok) {
      return new Response(null, { status: 500 });
    }

    code = await resp.text();
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }

  return new Response(code, { status: errored ? 203 : 200 });
};
