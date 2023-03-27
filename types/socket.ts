import type { IpInfo } from "../client/data.ts";

export interface ComputerToServerEvents {}

export interface ServerToComputerEvents {
  authenticated: (auth: boolean) => void;
  createWorker: (id: string, cb?: (succeeded: boolean) => void) => void;
  destroyWorker: (id: string) => void;
  runWorker: (
    id: string,
    code: string,
    cb?: (out: [boolean, any]) => void
  ) => void;
}

export interface ClientToServerEvents {
  createWorker: (id: string, cb?: (succeeded: boolean) => void) => void;
  eval: (id: string, code: string, cb?: (out: [boolean, any]) => void) => void;
  destroyWorker: (id: string) => void;
}

export interface ServerToClientEvents {
  authenticated: (auth: boolean) => void;
  init: (data: [string, ComputerData][]) => void;
  computerConnected: (id: string, data: ComputerData) => void;
  computerDisconnected: (id: string) => void;
}

export interface InterServerEvents {}

export interface ComputerData {
  url: string;
  version: string;
  ipInfo: IpInfo;
  env: Record<string, string>;
}

export interface ClientData {
  username: string;
}
