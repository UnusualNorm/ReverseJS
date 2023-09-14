import "websocket_broadcastchannel/polyfill.ts";
import {
  clearMessages,
  type ClientMessage,
  clients,
  isClientConnected,
  onClientConnected,
  onEval,
  onMessage,
  onPostMessage,
} from "./server.ts";

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
export const remoteClients = new Map<string, string[]>();

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

// ----- BROADCAST CHANNEL HELPERS ----- //

export function onServerDisconnected(serverId: string) {
  servers.delete(serverId);
  remoteClients.delete(serverId);
  console.info(`[BC] Server disconnected from network! (${serverId})`);
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

setInterval(clearOldServers, 1000 * 10); // 10 seconds
setInterval(broadcastKeepAlive, 1000 * 5); // 5 seconds

channel.onmessage = onBroadcastMessage;
broadcastConnected(false);
