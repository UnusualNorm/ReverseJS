import type { HandlerContext } from "$fresh/server.ts";
import type { GlobalState } from "../_middleware.ts";
import { bundle } from "emit";

export const handler = async (
  req: Request,
  _ctx: HandlerContext<unknown, GlobalState>,
): Promise<Response> => {
  const userCode = await req.text();
  if (!userCode) {
    return new Response(null, { status: 400 });
  }

  let code: string;
  try {
    code = (await bundle(
      "data:application/typescript," + encodeURIComponent(userCode),
    )).code;
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }

  return new Response(code, { status: 200 });
};
