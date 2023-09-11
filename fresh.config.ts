import { defineConfig } from "$fresh/server.ts";
import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";
import { HOSTNAME, PORT } from "./env.ts";

export default defineConfig({
  plugins: [twindPlugin(twindConfig)],
  port: PORT,
  hostname: HOSTNAME,
});
