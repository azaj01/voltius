export interface ProcessEntry {
  pid: number;
  ppid: number;
  name: string;
  command: string;
  user: string;
  cpu_percent: number;
  mem_kb: number;
  status: string;
}

export interface ProcessSnapshot {
  ts: number;
  entries: ProcessEntry[];
}

export type SortCol = "cpu" | "mem" | "pid" | "name" | "user";
