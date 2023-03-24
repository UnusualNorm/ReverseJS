/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { serve } from "std/http/server.ts";
import { Server } from "socket_io/mod.ts";

import { ServerContext, StartOptions } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";

const opts: StartOptions = { plugins: [twindPlugin(twindConfig)] };

const ctx = await ServerContext.fromManifest(manifest, opts);
const io = new Server();

await serve(io.handler(ctx.handler()), opts);
