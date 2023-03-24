import io from "socket.io-client";
import { wait } from "wait/mod.ts";

const connectionSpinner = wait("Connecting to server...").start();
const socket = io("http://localhost:8080/");
socket.on("connect", () => connectionSpinner.succeed());
