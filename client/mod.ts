import type {
  ComputerToServerEvents,
  ServerToComputerEvents,
} from "../types/socket.ts";

import * as Comlink from "https://cdn.skypack.dev/comlink@4.4.1?dts";
import { io, type Socket } from "socket.io-client";

import config from "./config.json" assert { type: "json" };
import { getData } from "./data.ts";

async function connectToServer(socket: Socket<any, any>) {
  console.log(`Connecting to ${config.url}...`);
  // Keep track of the number of attempts the client has made to connect to
  // the server.
  let retryCount = 0;
  // Keep track of the resolve function of the promise to make sure we can
  // resolve the promise in the listeners.
  let resolvePromise: () => void;

  // Create a listener to handle successful authentication.
  const authListener = (auth: boolean) => {
    console.info("Connected to server!");
    // Remove the listeners from the socket.
    socket.off("authenticated", authListener);
    socket.off("connect_error", errorListener);
    // If the server did not authenticate the client, exit the application.
    if (!auth) Deno.exit(1);
    // Resolve the promise.
    resolvePromise();
  };

  // Create a listener to handle connection errors.
  const errorListener = (err: Error) => {
    // Increment the number of connection attempts.
    retryCount++;
    // Disconnect the socket.
    socket.disconnect();
    // Update the spinner's text to show the error and that we're going to wait.
    console.error(
      `Failed to connect to server: "${err.message}", Retrying after 5 seconds...`
    );

    // After 5 seconds, try to reconnect.
    setTimeout(() => {
      // Update the spinner's text to show the attempt number.
      console.log(`Reconnecting to ${config.url}... (Attempt #${retryCount})`);
      // Remove the listeners from the socket.
      socket.off("authenticated", authListener);
      socket.off("connect_error", errorListener);
      // Resolve the promise.
      resolvePromise();
    }, 5000);
  };

  // Keep trying to connect to the server until the socket is connected.
  while (!socket.connected) {
    // Create a promise that will be resolved when the socket is connected or
    // an error occurs.
    await new Promise<void>((resolve) => {
      // Store the resolve function so we can call it from the listeners.
      resolvePromise = resolve;
      // Connect to the server.
      socket.connect();
      // Set the listeners on the socket.
      socket.on("authenticated", authListener);
      socket.on("connect_error", errorListener);
    });
  }

  // Remove the listeners from the socket.
  socket.off("authenticated", authListener);
  socket.off("connect_error", errorListener);
  // Return the socket.
  return socket;
}

const data = await getData(config);
const socket = io(config.url, {
  transports: ["websocket"],
  autoConnect: false,
  query: {
    data: JSON.stringify(data),
  },
}) as Socket<ServerToComputerEvents, ComputerToServerEvents>;
socket.on("disconnect", () => connectToServer(socket));

const workers = new Map<
  string,
  [
    Worker,
    AbortController,
    Promise<void>,
    Comlink.Remote<(code: string) => [boolean, any]>
  ]
>();

socket.on("createWorker", (id, cb) => {
  console.log(`Creating worker... (${id})`);
  try {
    // Create a new worker and pass it the worker.ts file
    const worker = new Worker(new URL("./worker.ts", import.meta.url).href, {
      type: "module",
    });
    // Create a new abort controller to be able to terminate the worker
    const controller = new AbortController();

    // Create a promise that resolves when the worker is aborted
    const abortPromise = new Promise<void>((resolve) =>
      controller.signal.addEventListener("abort", () => resolve())
    );

    // Await the worker to return its eval function
    const workerEval = Comlink.wrap(worker) as Comlink.Remote<
      (code: string) => Promise<[boolean, any]>
    >;

    // Store the worker, controller, and eval function in a Map
    workers.set(id, [worker, controller, abortPromise, workerEval]);
    // Succeed the spinner
    console.info(`Created worker! (${id})`);
    // Call the callback with true
    cb?.(true);
  } catch (e) {
    // Failed to create the worker, fail the spinner
    console.error(`Failed to create worker... (${id}, ${e})`);
    // Call the callback with false
    cb?.(false);
  }
});

socket.on("destroyWorker", (id) => {
  console.log(`Destroying worker... (${id})`);

  // Try to destroy the worker.
  try {
    // Get the controller for the worker.
    const controller = workers.get(id)?.[1];
    // If the controller exists, abort it.
    if (controller) controller.abort();
    // Delete the worker from the workers map.
    workers.delete(id);
    // Indicate that the worker has been successfully destroyed.
    console.info(`Destroyed worker! (${id})`);
  } catch (e) {
    // Indicate that the worker failed to destroy.
    console.error(`Failed to destroy worker... (${id}, ${e})`);
  }
});

socket.on("runWorker", async (id, code, cb) => {
  console.log(`Running worker... (${id}, ${JSON.stringify(code)})`);
  // Get the worker eval function
  const workerEval = workers.get(id)?.[3];

  // If the worker eval function does not exist, return an error
  if (!workerEval) {
    console.error(`Failed to find worker eval... (${id})`);
    return cb?.([false, "Worker not found"]);
  }

  // Try to run the code
  try {
    // Run the code
    const out = await Promise.any([
      workerEval(code),
      workers
        .get(id)![2]
        .then(() => [false, "Worker aborted"] as [boolean, string]),
    ]);

    // Check if the code ran successfully
    if (out[0]) console.info(`Ran worker! (${id}, ${JSON.stringify(out[1])})`);
    else
      console.error(
        `Worker failed to run... (${id}, ${JSON.stringify(out[1])})`
      );

    // Call the callback with the output
    cb?.(out);
  } catch (e) {
    // If the code failed to run, return an error
    console.error(`Failed to run worker... (${id}, ${JSON.stringify(e)})`);
    cb?.([false, e]);
  }
});

await connectToServer(socket);
