import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { SerialConnectParams } from "@/types";

export async function serialConnect(params: SerialConnectParams): Promise<void> {
  return invoke("serial_connect", {
    sessionId: params.sessionId,
    port: params.port,
    baud: params.baud,
    dataBits: params.dataBits ?? null,
    parity: params.parity ?? null,
    stopBits: params.stopBits ?? null,
    flowControl: params.flowControl ?? null,
  });
}

export async function serialWrite(sessionId: string, data: Uint8Array): Promise<void> {
  return invoke("serial_write", { sessionId, data: Array.from(data) });
}

export async function serialDisconnect(sessionId: string): Promise<void> {
  return invoke("serial_disconnect", { sessionId });
}

export async function serialListPorts(): Promise<{ name: string; path: string }[]> {
  return invoke("serial_list_ports");
}

export async function onSerialOutput(
  sessionId: string,
  callback: (data: Uint8Array) => void,
): Promise<UnlistenFn> {
  return listen<number[]>(`serial-output-${sessionId}`, (event) => {
    callback(new Uint8Array(event.payload));
  });
}

export async function onSerialClosed(
  sessionId: string,
  callback: () => void,
): Promise<UnlistenFn> {
  return listen(`serial-closed-${sessionId}`, () => {
    callback();
  });
}
