import {
  broadcastClearMessages,
  broadcastClientConnected,
  broadcastClientDisconnected,
  broadcastClientMessage,
  broadcastDisconnected,
  broadcastEval,
  broadcastPostMessage,
  remoteClients,
  serverId,
} from "./bridge.ts";

export type ClientInfo =
  & {
    clientId: string;
  }
  & (
    {
      fetched: false;
    } | {
      fetched: true;
      username: string;
      platform: string;
    }
  );

export interface ClientMessage {
  clientId: string;
  userId: string;
  data: string;
  timestamp: number;
}

export const clients = new Map<string, [WebSocket, ClientInfo]>();
export const messages = new Map<string, ClientMessage[]>();

// ----- HELPERS ----- //

export function isClientMessage(data: unknown): data is ClientMessage {
  if (typeof data !== "object" || data === null) return false;
  if (!("userId" in data) || typeof data.userId !== "string") return false;
  if (!("data" in data) || typeof data.data !== "string") return false;
  return true;
}

// ----- UTILS ----- //

export function clearOldMessages() {
  const now = Date.now();
  const aliveTime = 1000 * 60 * 10; // 10 minutes
  let clearedMessages = 0;
  for (const [id, msgs] of messages) {
    const newMessages = msgs.filter((msg) => now - msg.timestamp <= aliveTime);

    if (newMessages.length > 0) {
      messages.set(
        id,
        newMessages,
      );
    } else messages.delete(id);

    clearedMessages += msgs.length - newMessages.length;
  }

  if (clearedMessages > 0) {
    console.info(`[WS] Cleared ${clearedMessages} old messages!`);
  }
}

export function clearMessages(userId: string, remote = false) {
  messages.delete(userId);
  if (!remote) broadcastClearMessages(userId);
}

export function onMessage(
  userId: string,
  message: ClientMessage,
  remote = false,
) {
  messages.set(userId, [...(messages.get(userId) ?? []), message]);
  if (!remote) broadcastClientMessage(userId, message);
}

export function onClientConnected(
  clientId: string,
  ...args: [remote: false, socket: WebSocket] | [
    remote: true,
    remoteServerId: string,
  ]
) {
  if (!args[0]) {
    clients.set(clientId, [args[1], { clientId, fetched: false }]);
    broadcastClientConnected(clientId);
  } else {
    const newRemoteClients = new Set([
      ...(remoteClients.get(args[1]) ?? []),
      clientId,
    ]);

    remoteClients.set(args[1], Array.from(newRemoteClients));
  }
}

export function onClientDisconnected(clientId: string, remote = false) {
  if (!remote) {
    clients.delete(clientId);
    broadcastClientDisconnected(clientId);
  } else {
    const newRemoteClients = remoteClients.get(serverId)!.filter((id) =>
      id !== clientId
    );
    if (newRemoteClients.length > 0) {
      remoteClients.set(
        serverId,
        newRemoteClients,
      );
    } else remoteClients.delete(serverId);
  }
}

export function isClientConnected(clientId: string, localOnly = false) {
  return clients.has(clientId) ||
    (!localOnly &&
      Array.from(remoteClients.values()).some((ids) => ids.includes(clientId)));
}

export function getClients(): ClientInfo[] {
  return [
    ...[...clients.values()].map(([, info]) => info),
    ...Array.from(
      remoteClients.values(),
    ).map((ids) =>
      ids.map((id) => ({ clientId: id, fetched: false } as ClientInfo))
    ).flat(),
  ];
}

export function onEval(
  clientId: string,
  userId: string,
  userCode: string,
  remote = false,
) {
  const isLocalClient = isClientConnected(clientId, true);
  if (!isLocalClient && !remote) broadcastEval(userId, clientId, userCode);
  if (!isLocalClient) return;

  const client = clients.get(clientId)!;
  const code = `(()=>{
    const userId = decodeURIComponent("${encodeURIComponent(userId)}");
    const userCode = decodeURIComponent("${encodeURIComponent(userCode)}");
    const sendMessage = (data) => socket.send(JSON.stringify({ userId, data }));

    try {
      const worker = new Worker('data:application/javascript,' + encodeURIComponent(userCode), { type: "module" });

      if (!globalThis.workers) globalThis.workers = {};
      if (globalThis.workers[userId])
        globalThis.workers[userId].terminate();
      globalThis.workers[userId] = worker;

      worker.addEventListener("message", ({ data }) => sendMessage(JSON.stringify({ type: "message", data })));
      worker.addEventListener("error", ({ message }) => sendMessage(JSON.stringify({ type: "error", data: message })));
      worker.addEventListener("messageerror", ({ data }) => sendMessage(JSON.stringify({ type: "messageerror", data })));
    } catch (error) {
      sendMessage(JSON.stringify({ type: "workererror", data: error.message }));
    }
  })();`;

  client[0].send(code);
}

export function onPostMessage(
  clientId: string,
  userId: string,
  message: string,
  remote = false,
) {
  const isLocalClient = isClientConnected(clientId, true);
  if (!isLocalClient && !remote) {
    broadcastPostMessage(clientId, userId, message);
  }
  if (!isLocalClient) return;

  const client = clients.get(clientId)!;
  const code = `(()=>{
    const userId = decodeURIComponent("${encodeURIComponent(userId)}");
    const message = decodeURIComponent("${encodeURIComponent(message)}");
    if (!globalThis.workers) globalThis.workers = {};
    if (!globalThis.workers[userId]) return;
    globalThis.workers[userId].postMessage(message);
  })();`;

  client[0].send(code);
}

setInterval(clearOldMessages, 1000 * 60 * 5); // 5 minutes

// ----- WS ----- //

export function onConnection(socket: WebSocket) {
  let clientId!: string;
  socket.onopen = () => {
    while (!clientId) {
      const newId = Math.random().toString(36).slice(2);
      if (isClientConnected(clientId)) continue;
      clientId = newId;
    }

    onClientConnected(clientId, false, socket);
    console.info(`[WS] Client connected to server! (${clientId})`);
  };

  socket.onmessage = (event) => {
    let data: ClientMessage;
    try {
      data = JSON.parse(event.data);
    } catch (error) {
      console.error(
        `[WS] Failed to parse message from client... (${clientId}, ${error.message})`,
      );
      return;
    }

    if (!isClientMessage(data)) {
      console.error(`[WS] Invalid message from client... (${clientId})`);
      return;
    }

    data.clientId = clientId;
    data.timestamp = Date.now();
    onMessage(data.userId, data);
    console.info(`[WS] Recieved message from client! (${clientId})`);
  };

  socket.onclose = () => {
    console.info(`[WS] Client disconnected from server... (${clientId})`);
    onClientDisconnected(clientId, false);
  };
}

Deno.addSignalListener("SIGINT", () => {
  broadcastDisconnected();
  Deno.exit();
});
