import { defineConfig } from "$fresh/server.ts";
import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";
import { FRESH_HOSTNAME, FRESH_PORT } from "./env.ts";

export default defineConfig({
  plugins: [twindPlugin(twindConfig)],
  port: FRESH_PORT,
  hostname: FRESH_HOSTNAME,
});
