import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { REVERSEJS_PASSWORD } from "../env.ts";

export interface GlobalState {
  id: string;
  url: string;
}

export const handler = [
  function authHandler(
    req: Request,
    ctx: MiddlewareHandlerContext<GlobalState>,
  ): Response | Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/client") {
      return ctx.next();
    }

    // https://stackoverflow.com/questions/23616371/basic-http-authentication-with-node-and-express-4
    // -----------------------------------------------------------------------
    // authentication middleware

    const auth = {
      password: REVERSEJS_PASSWORD,
    };

    // parse login and password from headers
    const b64auth = (req.headers.get("authorization") || "").split(" ")[1] ||
      "";
    const [login, password] = atob(b64auth).split(":");

    ctx.state.id = login;

    // Verify login and password are set and correct
    if (
      login.match(/^[a-zA-Z0-9]*$/) && password && password === auth.password
    ) {
      // Access granted...
      return ctx.next();
    }

    // Access denied...
    return new Response("Authentication required.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="401"' },
    });

    // -----------------------------------------------------------------------
  },
  function urlHandler(
    req: Request,
    ctx: MiddlewareHandlerContext<GlobalState>,
  ): Promise<Response> {
    ctx.state.url = req.url;
    return ctx.next();
  },
];
