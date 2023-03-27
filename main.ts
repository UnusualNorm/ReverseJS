/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import "dotenv/load.ts";
const port = parseInt(Deno.env.get("PORT") ?? "8080");
const usernames = Deno.env.get("USERNAMES")?.split(",") ?? [];
const passwords = Deno.env.get("PASSWORDS")?.split(",") ?? [];
const users = new Map<string, string>();
for (let i = 0; i < usernames.length; i++)
  users.set(usernames[i], passwords[i]);

import { serve } from "std/http/server.ts";
import { Namespace, Server } from "socket_io/mod.ts";

import { ServerContext, StartOptions } from "$fresh/server.ts";
import { DefaultEventsMap } from "socket_io/packages/event-emitter/mod.ts";
import manifest from "./fresh.gen.ts";

import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";
import {
  ClientToServerEvents,
  ComputerData,
  ComputerToServerEvents,
  ServerToClientEvents,
  ServerToComputerEvents,
} from "./types/socket.ts";

import clientConfig from "./client/config.json" assert { type: "json" };
import { verifyData } from "./client/data.ts";

const opts: StartOptions = { port, plugins: [twindPlugin(twindConfig)] };

// @ts-ignore: There's a type error here, but it's not a problem.
const ctx = await ServerContext.fromManifest(manifest, opts);
const io = new Server<ClientToServerEvents, ServerToClientEvents>({
  cors: {
    origin: "*",
  },
  maxHttpBufferSize: 1e8, // 100 MB
});

io.on("connection", (socket) => {
  console.log(`Client connected! (${socket.id})`);

  try {
    if (!socket.handshake.query.has("username"))
      throw new Error("No username provided!");
    if (!socket.handshake.query.has("password"))
      throw new Error("No password provided!");

    const username = socket.handshake.query.get("username")!;
    const password = socket.handshake.query.get("password")!;
    if (!users.has(username)) throw new Error("Invalid username provided!");
    if (users.get(username) !== password)
      throw new Error("Invalid password provided!");

    socket.data = { username };
    socket.join("authenticated");
    socket.emit("authenticated", true);
    console.log(`Client authenticated! (${socket.id})`);
  } catch (e) {
    console.error(`Client failed to authenticate! (${socket.id}, ${e}))`);
    socket.emit("authenticated", false);
    socket.disconnect();
    return;
  }

  socket.on("disconnect", () => {
    console.log(`Client disconnected! (${socket.id})`);
  });
});

(
  io.of("/computer") as Namespace<
    ComputerToServerEvents,
    ServerToComputerEvents,
    DefaultEventsMap,
    ComputerData
  >
).on("connection", (socket) => {
  console.log(`Computer connected! (${socket.id})`);
  try {
    if (!socket.handshake.query.has("data"))
      throw new Error("No data provided!");

    const data = JSON.parse(socket.handshake.query.get("data")!);
    if (!verifyData(data)) throw new Error("Invalid data provided!");
    if (data.version !== clientConfig.version)
      throw new Error("Invalid version provided!");

    socket.data = data;
    socket.join("authenticated");
    socket.emit("authenticated", true);
    io.in("authenticated").emit("computerConnected", socket.id, data);
    console.log(`Computer authenticated! (${socket.id})`);
  } catch (e) {
    console.error(`Computer failed to authenticate! (${socket.id}, ${e}))`);
    socket.emit("authenticated", false);
    socket.disconnect();
    return;
  }

  socket.on("disconnect", () => {
    console.log(`Computer disconnected! (${socket.id})`);
    io.in("authenticated").emit("computerDisconnected", socket.id);
  });
});

await serve(io.handler(ctx.handler()), opts);
