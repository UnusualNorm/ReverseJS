import "websocket_broadcastchannel/polyfill.ts";

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

enum BroadcastChannelMessageType {
  Connected,
  IdCollision,
  KeepAlive,
  Disconnected,
  Message,
  ClearMessages,
  Eval,
  ClientConnected,
  ClientDisconnected,
  PostMessage,
}

type BroadcastChannelMessage = {
  type: BroadcastChannelMessageType.Connected;
  serverId: string;
  response: boolean;
} | {
  type: BroadcastChannelMessageType.IdCollision;
  serverId: string;
} | {
  type: BroadcastChannelMessageType.KeepAlive;
  serverId: string;
} | {
  type: BroadcastChannelMessageType.Disconnected;
  serverId: string;
} | {
  type: BroadcastChannelMessageType.Message;
  serverId: string;
  userId: string;
  message: ClientMessage;
} | {
  type: BroadcastChannelMessageType.ClearMessages;
  serverId: string;
  userId: string;
} | {
  type: BroadcastChannelMessageType.Eval;
  serverId: string;
  userId: string;
  clientId: string;
  code: string;
} | {
  type: BroadcastChannelMessageType.ClientConnected;
  serverId: string;
  clientId: string;
} | {
  type: BroadcastChannelMessageType.ClientDisconnected;
  serverId: string;
  clientId: string;
} | {
  type: BroadcastChannelMessageType.PostMessage;
  serverId: string;
  clientId: string;
  userId: string;
  message: string;
};

export const channel = new BroadcastChannel("reversejs");
// number = timestamp of last contact
export const servers = new Map<string, number>();
export let serverId: string = Math.random().toString(36).slice(2);
export const clients = new Map<string, [WebSocket, ClientInfo]>();
export const remoteClients = new Map<string, string[]>();
export const messages = new Map<string, ClientMessage[]>();

// ----- BROADCAST CHANNEL EMITTERS ----- //

export function broadcastMessage(message: BroadcastChannelMessage) {
  channel.postMessage(JSON.stringify(message));
}

export function broadcastConnected(response: boolean) {
  broadcastMessage({
    type: BroadcastChannelMessageType.Connected,
    serverId,
    response,
  });
}

export function broadcastIdCollision() {
  broadcastMessage({ type: BroadcastChannelMessageType.IdCollision, serverId });
}

export function broadcastKeepAlive() {
  broadcastMessage({ type: BroadcastChannelMessageType.KeepAlive, serverId });
}

export function broadcastDisconnected() {
  broadcastMessage({
    type: BroadcastChannelMessageType.Disconnected,
    serverId,
  });
}

export function broadcastClientMessage(userId: string, message: ClientMessage) {
  broadcastMessage({
    type: BroadcastChannelMessageType.Message,
    serverId,
    userId,
    message,
  });
}

export function broadcastClearMessages(userId: string) {
  broadcastMessage({
    type: BroadcastChannelMessageType.ClearMessages,
    serverId,
    userId,
  });
}

export function broadcastEval(userId: string, clientId: string, code: string) {
  broadcastMessage({
    type: BroadcastChannelMessageType.Eval,
    serverId,
    userId,
    clientId,
    code,
  });
}

export function broadcastClientConnected(clientId: string) {
  broadcastMessage({
    type: BroadcastChannelMessageType.ClientConnected,
    serverId,
    clientId,
  });
}

export function broadcastClientDisconnected(clientId: string) {
  broadcastMessage({
    type: BroadcastChannelMessageType.ClientDisconnected,
    serverId,
    clientId,
  });
}

export function broadcastPostMessage(
  clientId: string,
  userId: string,
  message: string,
) {
  broadcastMessage({
    type: BroadcastChannelMessageType.PostMessage,
    serverId,
    clientId,
    userId,
    message,
  });
}

// ----- BROADCAST CHANNEL RECIEVERS ----- //

export function onBroadcastMessage(
  event: MessageEvent,
) {
  const data: BroadcastChannelMessage = JSON.parse(event.data);
  switch (data.type) {
    case BroadcastChannelMessageType.Connected:
      onBroadcastConnected(data.serverId, data.response);
      break;
    case BroadcastChannelMessageType.IdCollision:
      onBroadcastIdCollision(data.serverId);
      break;
    case BroadcastChannelMessageType.KeepAlive:
      onBroadcastKeepAlive(data.serverId);
      break;
    case BroadcastChannelMessageType.Disconnected:
      onBroadcastDisconnected(data.serverId);
      break;
    case BroadcastChannelMessageType.Message:
      onBroadcastMessageToUser(data.serverId, data.userId, data.message);
      break;
    case BroadcastChannelMessageType.ClearMessages:
      onBroadcastClearMessages(data.serverId, data.userId);
      break;
    case BroadcastChannelMessageType.Eval:
      onBroadcastEval(data.serverId, data.userId, data.clientId, data.code);
      break;
    case BroadcastChannelMessageType.ClientConnected:
      onBroadcastClientConnected(data.serverId, data.clientId);
      break;
    case BroadcastChannelMessageType.ClientDisconnected:
      onBroadcastClientDisconnected(data.serverId, data.clientId);
      break;
    case BroadcastChannelMessageType.PostMessage:
      onBroadcastPostMessage(
        data.serverId,
        data.clientId,
        data.userId,
        data.message,
      );
      break;
  }
}

export function onBroadcastConnected(
  remoteServerId: string,
  response: boolean,
) {
  if (remoteServerId === serverId) {
    console.info(`[BC] Server id collision! (${serverId})`);
    broadcastIdCollision();
    return;
  }

  servers.set(remoteServerId, Date.now());
  if (!response) {
    console.info(`[BC] Server connected to network! (${remoteServerId})`);
    broadcastConnected(true);
  }

  for (const [_clientId, [_socket, info]] of clients) {
    // It's okay to resend the clients to everyone, for now
    broadcastClientConnected(info.clientId);
  }
}

export function onBroadcastIdCollision(remoteServerId: string) {
  if (remoteServerId !== serverId) return;
  console.info(`[BC] Server id collision! (${remoteServerId})`);

  serverId = Math.random().toString(36).slice(2);
  broadcastConnected(false);
}

export function onBroadcastKeepAlive(remoteServerId: string) {
  servers.set(remoteServerId, Date.now());
  //console.debug(`[BC] Server keep alive! (${remoteServerId})`);
}

export function onBroadcastDisconnected(remoteServerId: string) {
  onServerDisconnected(remoteServerId);
}

export function onBroadcastMessageToUser(
  remoteServerId: string,
  userId: string,
  message: ClientMessage,
) {
  servers.set(remoteServerId, Date.now());
  onMessage(userId, message, true);
  console.info(
    `[BC] Recieved message from remote client! (${remoteServerId}, ${userId})`,
  );
}

export function onBroadcastClearMessages(
  remoteServerId: string,
  userId: string,
) {
  servers.set(remoteServerId, Date.now());
  clearMessages(userId, true);
  // console.debug(
  //   `[BC] Cleared messages for user! (${remoteServerId}, ${userId})`,
  // );
}

export function onBroadcastEval(
  remoteServerId: string,
  userId: string,
  clientId: string,
  code: string,
) {
  servers.set(remoteServerId, Date.now());
  onEval(clientId, userId, code, true);
  if (isClientConnected(clientId, true)) {
    console.info(
      `[BC] Evaluated code for user! (${remoteServerId}, ${clientId}, ${userId})`,
    );
  }
}

export function onBroadcastClientConnected(
  remoteServerId: string,
  clientId: string,
) {
  servers.set(remoteServerId, Date.now());
  onClientConnected(clientId, true, remoteServerId);
  console.info(
    `[BC] Client connected to server! (${remoteServerId}, ${clientId})`,
  );
}

export function onBroadcastClientDisconnected(
  remoteServerId: string,
  clientId: string,
) {
  servers.set(remoteServerId, Date.now());
  remoteClients.set(
    remoteServerId,
    remoteClients.get(remoteServerId)!.filter((id) => id !== clientId),
  );
  console.info(`[BC] Client disconnected from server! (${clientId})`);
}

export function onBroadcastPostMessage(
  remoteServerId: string,
  clientId: string,
  userId: string,
  message: string,
) {
  servers.set(remoteServerId, Date.now());
  onPostMessage(clientId, userId, message, true);
  if (isClientConnected(clientId, true)) {
    console.info(
      `[BC] Posted message for client! (${remoteServerId}, ${clientId}, ${userId})`,
    );
  }
}

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
  for (const [id, msgs] of messages) {
    const newMessages = msgs.filter((msg) => now - msg.timestamp <= aliveTime);

    if (newMessages.length > 0) {
      messages.set(
        id,
        newMessages,
      );
    } else messages.delete(id);
  }
  //console.debug(`[WS] Cleared old messages!`);
}

export function clearOldServers() {
  const now = Date.now();
  const aliveTime = 1000 * 15; // 15 seconds
  for (const [id, timestamp] of servers) {
    if (now - timestamp > aliveTime) {
      onServerDisconnected(id);
    }
  }
  //console.debug(`[BC] Cleared old servers!`);
}

export function clearMessages(userId: string, remote = false) {
  messages.delete(userId);
  if (!remote) broadcastClearMessages(userId);
}

export function onServerDisconnected(serverId: string) {
  servers.delete(serverId);
  remoteClients.delete(serverId);
  console.info(`[BC] Server disconnected from network! (${serverId})`);
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
setInterval(clearOldServers, 1000 * 10); // 10 seconds
setInterval(broadcastKeepAlive, 1000 * 5); // 5 seconds

channel.onmessage = onBroadcastMessage;
broadcastConnected(false);

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
