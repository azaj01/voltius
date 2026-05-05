import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { ProcessSnapshot } from "@/plugins/process-manager/types";

export async function processesStart(sessionId: string, isRemote: boolean): Promise<string> {
  return invoke("processes_start", { sessionId, isRemote });
}

export async function processesStop(streamId: string): Promise<void> {
  return invoke("processes_stop", { streamId });
}

export async function processKill(
  sessionId: string,
  pid: number,
  isRemote: boolean,
  force: boolean,
): Promise<void> {
  return invoke("process_kill", { sessionId, pid, isRemote, force });
}

export function onProcessesSnapshot(
  streamId: string,
  cb: (snapshot: ProcessSnapshot) => void,
): Promise<UnlistenFn> {
  return listen<ProcessSnapshot>(`processes:snapshot:${streamId}`, ({ payload }) => cb(payload));
}
